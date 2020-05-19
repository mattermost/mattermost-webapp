// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @elasticsearch @autocomplete

import users from '../../../fixtures/users.json';

import {
    createEmail,
    createPrivateChannel,
    enableElasticSearch,
    searchForChannel,
    withTimestamp,
} from './helpers';

describe('Autocomplete with Elasticsearch - Channel', () => {
    const timestamp = Date.now();
    let team = {};
    let user;

    before(() => {
        // # Execute the before hook based on current config
        cy.apiLogin('sysadmin');

        // * Check if server has license for Elasticsearch
        cy.requireLicenseForFeature('Elasticsearch');

        // # Create new team to run tests against
        cy.apiCreateTeam(`elastic-${timestamp}`, `elastic-${timestamp}`).then((response) => {
            team = response.body;

            const daredevil = {
                username: withTimestamp('daredevil', timestamp),
                firstName: 'Matt',
                lastName: 'Murdock',
                email: createEmail('daredevil', timestamp),
                nickname: withTimestamp('attorney', timestamp),
            };

            // # Setup new channel and user
            cy.apiCreateNewUser(daredevil, [team.id]).as('newUser');
        });

        enableElasticSearch();
        cy.apiLogout();

        // # Login and navigate to team with new user
        cy.get('@newUser').then((newUser) => {
            user = newUser;
            cy.apiLogin(user.username, user.password);
            cy.visit(`/${team.name}`);
        });
    });

    afterEach(() => {
        cy.reload();
    });

    it("private channel I don't belong to does not appear", () => {
        // # Create private channel, do not add new user to it (sets @privateChannel alias)
        createPrivateChannel(team.id).then((channel) => {
            // # Go to off-topic channel to partially reload the page
            cy.get('#sidebarChannelContainer').should('be.visible').within(() => {
                cy.findAllByText('Off-Topic').should('be.visible').click();
            });

            // # Search for the private channel
            searchForChannel(channel.name);

            // * And it should not appear
            cy.queryByTestId(channel.name).
                should('not.exist');
        });
    });

    it('private channel I do belong to appears', () => {
        // # Create private channel and add new user to it (sets @privateChannel alias)
        createPrivateChannel(team.id, user).then((channel) => {
            // # Go to off-topic channel to partially reload the page
            cy.get('#sidebarChannelContainer').should('be.visible').within(() => {
                cy.findAllByText('Off-Topic').should('be.visible').click();
            });

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
            createPrivateChannel(teamResponse.data.id).then((channel) => {
                // # Go to off-topic channel to partially reload the page
                cy.get('#sidebarChannelContainer').should('be.visible').within(() => {
                    cy.findAllByText('Off-Topic').should('be.visible').click();
                });

                // # Search for the private channel
                searchForChannel(channel.name);

                // * Channel should not appear in the search results
                cy.queryByTestId(channel.name).
                    should('not.exist');
            });
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
