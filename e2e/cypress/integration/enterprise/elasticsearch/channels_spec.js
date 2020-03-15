// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../../fixtures/users.json';

import {withTimestamp, createEmail, enableElasticSearch, disableElasticSearch} from './helpers';

const timestamp = Date.now();

function createPrivateChannel(teamId, userToAdd = null) {
    const baseUrl = Cypress.config('baseUrl');

    // As the sysadmin, create a private channel
    cy.task('externalRequest', {
        user: users.sysadmin,
        method: 'post',
        baseUrl,
        path: 'channels',
        data: {
            team_id: teamId,
            name: 'private' + Date.now(),
            display_name: 'private' + Date.now(),
            type: 'P',
            header: '',
            purpose: '',
        },
    }).then((privateResponse) => {
        expect(privateResponse.status).to.equal(201);
        const channel = privateResponse.data;

        cy.wrap(channel).as('privateChannel');

        // If we have a user to add to the team, add them now
        if (userToAdd) {
            // First get the user details by email of the user
            cy.apiGetUserByEmail(userToAdd.email).then((userResponse) => {
                const user = userResponse.body;

                // Add user to team
                cy.task('externalRequest', {
                    user: users.sysadmin,
                    method: 'post',
                    baseUrl,
                    path: `channels/${channel.id}/members`,
                    data: {
                        user_id: user.id,
                    },
                });
            });
        }
    });
}

function searchForChannel(name) {
    // Open up channel switcher
    cy.typeCmdOrCtrl().type('k');

    // Clear out and type in the name
    cy.get('#quickSwitchInput').
        should('be.visible').
        as('input').
        clear().
        type(name);
}

describe('search for channel with', () => {
    let team = {};
    let user;

    before(() => {
        // * Check if server has license for Elasticsearch
        cy.requireLicenseForFeature('Elasticsearch');

        // # Login
        cy.apiLogin('sysadmin');

        // # Create new team to run tests against
        cy.apiCreateTeam(`renaming-${timestamp}`, `renaming-${timestamp}`).then((response) => {
            team = response.body;

            const daredevil = {
                username: withTimestamp('daredevil', timestamp),
                firstName: 'Matt',
                lastName: 'Murdock',
                email: createEmail('daredevil', timestamp),
                nickname: withTimestamp('attorney', timestamp),
            };

            // # Setup new channel and user
            cy.createNewUser(daredevil, [team.id]).then((userResponse) => {
                user = userResponse;
            });
        });
    });

    describe('elastic search enabled', () => {
        before(() => {
            // # Execute the before hook based on current config
            enableElasticSearch();

            // # Login and navigate to team with new user
            cy.apiLogin(user.username, user.password);
            cy.visit(`/${team.name}`);
        });

        afterEach(() => {
            cy.reload();
        });

        it("private channel I don't belong to does not appear", () => {
            // # Create private channel, do not add new user to it (sets @privateChannel alias)
            createPrivateChannel(team.id);

            cy.get('@privateChannel').then((channel) => {
                // # Search for the private channel
                searchForChannel(channel.name);

                // * And it should not appear
                cy.queryByTestId(channel.name).
                    should('not.exist');
            });
        });

        it('private channel I do belong to appears', () => {
            // # Create private channel and add new user to it (sets @privateChannel alias)
            createPrivateChannel(team.id, user);

            cy.get('@privateChannel').then((channel) => {
                // # Search for the private channel
                searchForChannel(channel.name);

                // * Suggestion list should appear
                cy.get('#suggestionList').should('be.visible');

                // * Channel should appear in the list
                cy.queryByTestId(channel.name).
                    should('be.visible');
            });
        });

        it('channel outside of team does not appear', () => {
            const teamName = 'elastic-private-' + Date.now();
            const baseUrl = Cypress.config('baseUrl');

            // # As admin, create a new team that the new user is not a member of
            cy.task('externalRequest', {
                user: users.sysadmin,
                path: 'teams',
                baseUrl,
                method: 'post',
                data: {
                    name: teamName,
                    display_name: teamName,
                    type: 'O',
                },
            }).then((teamResponse) => {
                expect(teamResponse.status).to.equal(201);

                // # Create a private channel where the new user is not a member of
                createPrivateChannel(teamResponse.data.id);
            });

            cy.get('@privateChannel').then((channel) => {
                // # Search for the private channel
                searchForChannel(channel.name);

                // * Channel sohuld not appear in the search results
                cy.queryByTestId(channel.name).
                    should('not.exist');
            });
        });

        describe('channel with', () => {
            let channelId;

            before(() => {
                // # Login as admin
                cy.apiLogin('sysadmin');
                cy.visit(`/${team.name}`);

                const name = 'hellothere';

                // # Create a new channel
                cy.apiCreateChannel(team.id, name, name).then((channelResponse) => {
                    channelId = channelResponse.body.id;
                });

                // * Verify channel without special characters appears normally
                searchForChannel(name);

                cy.reload();
            });

            it('dots appears', () => {
                const name = 'hello.there';

                // Change name of channel
                cy.apiPatchChannel(channelId, {display_name: name});

                // * Search for channel should work
                searchForChannel(name);
            });

            it('dashes appears', () => {
                const name = 'hello-there';

                // Change name of channel
                cy.apiPatchChannel(channelId, {display_name: name});

                // * Search for channel should work
                searchForChannel(name);
            });

            it('underscores appears', () => {
                const name = 'hello_there';

                // Change name of channel
                cy.apiPatchChannel(channelId, {display_name: name});

                // * Search for channel should work
                searchForChannel(name);
            });

            it('dots, dashes, and underscores appears', () => {
                const name = 'he.llo-the_re';

                // Change name of channel
                cy.apiPatchChannel(channelId, {display_name: name});

                // * Search for channel should work
                searchForChannel(name);
            });
        });
    });

    describe('elastic search disabled', () => {
        before(() => {
            // # Execute the before hook based on current config
            disableElasticSearch();

            // # Login and navigate to team with new user
            cy.apiLogin(user.username, user.password);
            cy.visit(`/${team.name}`);
        });

        afterEach(() => {
            cy.reload();
        });

        it("private channel I don't belong to does not appear", () => {
            // # Create private channel, do not add new user to it (sets @privateChannel alias)
            createPrivateChannel(team.id);

            cy.get('@privateChannel').then((channel) => {
                // # Search for the private channel
                searchForChannel(channel.name);

                // * And it should not appear
                cy.queryByTestId(channel.name).
                    should('not.exist');
            });
        });

        it('private channel I do belong to appears', () => {
            // # Create private channel and add new user to it (sets @privateChannel alias)
            createPrivateChannel(team.id, user);

            cy.get('@privateChannel').then((channel) => {
                // # Search for the private channel
                searchForChannel(channel.name);

                // * Suggestion list should appear
                cy.get('#suggestionList').should('be.visible');

                // * Channel should appear in the list
                cy.queryByTestId(channel.name).
                    should('be.visible');
            });
        });

        it('channel outside of team does not appear', () => {
            const teamName = 'elastic-private-' + Date.now();
            const baseUrl = Cypress.config('baseUrl');

            // # As admin, create a new team that the new user is not a member of
            cy.task('externalRequest', {
                user: users.sysadmin,
                path: 'teams',
                baseUrl,
                method: 'post',
                data: {
                    name: teamName,
                    display_name: teamName,
                    type: 'O',
                },
            }).then((teamResponse) => {
                expect(teamResponse.status).to.equal(201);

                // # Create a private channel where the new user is not a member of
                createPrivateChannel(teamResponse.data.id);
            });

            cy.get('@privateChannel').then((channel) => {
                // # Search for the private channel
                searchForChannel(channel.name);

                // * Channel sohuld not appear in the search results
                cy.queryByTestId(channel.name).
                    should('not.exist');
            });
        });

        describe('channel with', () => {
            let channelId;

            before(() => {
                // # Login as admin
                cy.apiLogin('sysadmin');
                cy.visit(`/${team.name}`);

                const name = 'hellothere';

                // # Create a new channel
                cy.apiCreateChannel(team.id, name, name).then((channelResponse) => {
                    channelId = channelResponse.body.id;
                });

                // * Verify channel without special characters appears normally
                searchForChannel(name);

                cy.reload();
            });

            it('dots appears', () => {
                const name = 'hello.there';

                // Change name of channel
                cy.apiPatchChannel(channelId, {display_name: name});

                // * Search for channel should work
                searchForChannel(name);
            });

            it('dashes appears', () => {
                const name = 'hello-there';

                // Change name of channel
                cy.apiPatchChannel(channelId, {display_name: name});

                // * Search for channel should work
                searchForChannel(name);
            });

            it('underscores appears', () => {
                const name = 'hello_there';

                // Change name of channel
                cy.apiPatchChannel(channelId, {display_name: name});

                // * Search for channel should work
                searchForChannel(name);
            });

            it('dots, dashes, and underscores appears', () => {
                const name = 'he.llo-the_re';

                // Change name of channel
                cy.apiPatchChannel(channelId, {display_name: name});

                // * Search for channel should work
                searchForChannel(name);
            });
        });
    });
});
