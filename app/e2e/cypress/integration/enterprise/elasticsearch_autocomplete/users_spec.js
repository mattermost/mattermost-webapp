// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @elasticsearch @autocomplete

import {enableElasticSearch, getTestUsers} from './helpers';

describe('Autocomplete with Elasticsearch - Users', () => {
    const timestamp = Date.now();
    const testUsers = getTestUsers();
    let testTeam;

    before(() => {
        // * Check if server has license for Elasticsearch
        cy.apiRequireLicenseForFeature('Elasticsearch');

        // # Create new team for tests
        cy.apiCreateTeam(`elastic-${timestamp}`, `elastic-${timestamp}`).then(({team}) => {
            testTeam = team;

            // # Create pool of users for tests
            Cypress._.forEach(testUsers, (testUser) => {
                cy.apiCreateUser({user: testUser}).then(({user}) => {
                    cy.apiAddUserToTeam(testTeam.id, user.id);
                });
            });
        });

        // # Enable Elasticsearch
        enableElasticSearch();
    });

    describe('autocomplete', () => {
        // Helper function to start @mention
        function startAtMention(string) {
            // # Get the expected input
            cy.get('@input').clear().type(string);

            // * Suggestion list should appear
            cy.get('#suggestionList').should('be.visible');
        }

        describe('search for user in message input box', () => {
            const area = {
                getInput: () => {
                    cy.get('#post_textbox').
                        as('input').
                        should('be.visible').
                        clear();
                },
                verifySuggestion: (...expectedtestUsers) => {
                    expectedtestUsers.forEach((user) => {
                        cy.findByTestId(`mentionSuggestion_${user.username}`, {exact: false}).within((name) => {
                            cy.wrap(name).find('.mention--align').should('have.text', `@${user.username}`);
                            cy.wrap(name).find('.ml-2').should('have.text', `${user.first_name} ${user.last_name} (${user.nickname})`);
                        });
                    });
                },
            };

            before(() => {
                // # Navigate to the new teams town square
                cy.visit(`/${testTeam.name}/channels/town-square`);
            });

            describe('by @username', () => {
                it('unique partial returns single user', () => {
                    area.getInput();
                    startAtMention('@do');
                    area.verifySuggestion(testUsers.doctorstrange);
                });

                it('partial returns all testUsers that match', () => {
                    area.getInput();
                    startAtMention('@i');
                    area.verifySuggestion(testUsers.ironman);
                });

                it('full name returns single user', () => {
                    area.getInput();
                    startAtMention('@ironman');
                    area.verifySuggestion(testUsers.ironman);
                });
            });

            describe('by @firstname', () => {
                it('unique partial returns single user', () => {
                    area.getInput();
                    startAtMention('@wa');
                    area.verifySuggestion(testUsers.deadpool);
                });

                it('partial returns results  all testUsers that match', () => {
                    area.getInput();
                    startAtMention('@ste');
                    area.verifySuggestion(testUsers.captainamerica, testUsers.doctorstrange);
                });

                it('full name returns single user', () => {
                    area.getInput();
                    startAtMention('@tony');
                    area.verifySuggestion(testUsers.ironman);
                });
            });

            describe('by @lastname', () => {
                it('unique partial returns single user', () => {
                    area.getInput();
                    startAtMention('@ban');
                    area.verifySuggestion(testUsers.hulk);
                });

                it('partial returns results  all testUsers that match', () => {
                    area.getInput();
                    startAtMention('@ba');
                    area.verifySuggestion(testUsers.hawkeye, testUsers.hulk);
                });

                it('full name returns single user', () => {
                    area.getInput();
                    startAtMention('@stark');
                    area.verifySuggestion(testUsers.ironman);
                });
            });

            describe('by @nickname', () => {
                it('unique partial returns single user', () => {
                    area.getInput();
                    startAtMention('@gam');
                    area.verifySuggestion(testUsers.hulk);
                });

                it('partial returns results  all testUsers that match', () => {
                    area.getInput();
                    startAtMention('@pro');
                    area.verifySuggestion(testUsers.captainamerica, testUsers.ironman);
                });

                it('full name returns single user', () => {
                    area.getInput();
                    startAtMention('@ronin');
                    area.verifySuggestion(testUsers.hawkeye);
                });
            });

            describe('special characters in usernames are returned', () => {
                it('dots', () => {
                    area.getInput();
                    startAtMention('@dot.dot');
                    area.verifySuggestion(testUsers.dot);
                });

                it('dash', () => {
                    area.getInput();
                    startAtMention('@dash-dash');
                    area.verifySuggestion(testUsers.dash);
                });

                it('underscore', () => {
                    area.getInput();
                    startAtMention('@under_score');
                    area.verifySuggestion(testUsers.underscore);
                });
            });
        });

        describe('search for user in channel switcher', () => {
            const area = {
                getInput: () => {
                    cy.get('#quickSwitchInput').
                        should('be.visible').
                        as('input').
                        clear();
                },
                verifySuggestion: (...expectedtestUsers) => {
                    expectedtestUsers.forEach((user) => {
                        cy.findByTestId(user.username).
                            should('be.visible').
                            and('have.text', `@${user.username} - ${user.first_name} ${user.last_name} (${user.nickname})`);
                    });
                },
            };

            before(() => {
                // # Navigate to the new teams town square
                cy.visit(`/${testTeam.name}/channels/town-square`);
                cy.typeCmdOrCtrl().type('k');
                cy.get('#quickSwitchInput').should('be.visible');
            });

            describe('by @username', () => {
                it('unique partial returns single user', () => {
                    area.getInput();
                    startAtMention('@do');
                    area.verifySuggestion(testUsers.doctorstrange);
                });

                it('partial returns all testUsers that match', () => {
                    area.getInput();
                    startAtMention('@i');
                    area.verifySuggestion(testUsers.ironman);
                });

                it('full name returns single user', () => {
                    area.getInput();
                    startAtMention('@ironman');
                    area.verifySuggestion(testUsers.ironman);
                });
            });

            describe('by @firstname', () => {
                it('unique partial returns single user', () => {
                    area.getInput();
                    startAtMention('@wa');
                    area.verifySuggestion(testUsers.deadpool);
                });

                it('partial returns results  all testUsers that match', () => {
                    area.getInput();
                    startAtMention('@ste');
                    area.verifySuggestion(testUsers.captainamerica, testUsers.doctorstrange);
                });

                it('full name returns single user', () => {
                    area.getInput();
                    startAtMention('@tony');
                    area.verifySuggestion(testUsers.ironman);
                });
            });

            describe('by @lastname', () => {
                it('unique partial returns single user', () => {
                    area.getInput();
                    startAtMention('@ban');
                    area.verifySuggestion(testUsers.hulk);
                });

                it('partial returns results  all testUsers that match', () => {
                    area.getInput();
                    startAtMention('@ba');
                    area.verifySuggestion(testUsers.hawkeye, testUsers.hulk);
                });

                it('full name returns single user', () => {
                    area.getInput();
                    startAtMention('@stark');
                    area.verifySuggestion(testUsers.ironman);
                });
            });

            describe('by @nickname', () => {
                it('unique partial returns single user', () => {
                    area.getInput();
                    startAtMention('@gam');
                    area.verifySuggestion(testUsers.hulk);
                });

                it('partial returns results  all testUsers that match', () => {
                    area.getInput();
                    startAtMention('@pro');
                    area.verifySuggestion(testUsers.captainamerica, testUsers.ironman);
                });

                it('full name returns single user', () => {
                    area.getInput();
                    startAtMention('@ronin');
                    area.verifySuggestion(testUsers.hawkeye);
                });
            });

            describe('special characters in usernames are returned', () => {
                it('dots', () => {
                    area.getInput();
                    startAtMention('@dot.dot');
                    area.verifySuggestion(testUsers.dot);
                });

                it('dash', () => {
                    area.getInput();
                    startAtMention('@dash-dash');
                    area.verifySuggestion(testUsers.dash);
                });

                it('underscore', () => {
                    area.getInput();
                    startAtMention('@under_score');
                    area.verifySuggestion(testUsers.underscore);
                });
            });
        });

        it('users in correct in/out of channel sections', () => {
            const thor = testUsers.thor;
            const loki = testUsers.loki;

            // # Create new channel and add user to channel
            const channelName = `new-channel-${timestamp}`;
            cy.apiCreateChannel(testTeam.id, channelName, channelName).then(({channel}) => {
                cy.apiGetUserByEmail(thor.email).then(({user}) => {
                    cy.apiAddUserToChannel(channel.id, user.id);
                });

                cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            });

            // # Start an at mention that should return 2 users (in this case, the users share a last name)
            cy.get('#post_textbox').
                as('input').
                should('be.visible').
                clear().
                type('@odinson');

            // * Thor should be a channel member
            cy.findByTestId(thor.username, {exact: false}).within((name) => {
                cy.wrap(name).prev('.suggestion-list__divider').should('have.text', 'Channel Members');
                cy.wrap(name).find('.mention--align').should('have.text', `@${thor.username}`);
                cy.wrap(name).find('.ml-2').should('have.text', `${thor.first_name} ${thor.last_name} (${thor.nickname})`);
            });

            // * Loki should NOT be a channel member
            cy.findByTestId(loki.username, {exact: false}).within((name) => {
                cy.wrap(name).prev('.suggestion-list__divider').should('have.text', 'Not in Channel');
                cy.wrap(name).find('.mention--align').should('have.text', `@${loki.username}`);
                cy.wrap(name).find('.ml-2').should('have.text', `${loki.first_name} ${loki.last_name} (${loki.nickname})`);
            });
        });

        it('DM can be opened with a user not on your team or in your DM channel sidebar', () => {
            const thor = testUsers.thor;

            // # Open of the add direct message modal
            cy.get('#addDirectChannel').click({force: true});

            // # Type username into input
            cy.get('.more-direct-channels').
                find('input').
                should('exist').
                type(thor.username, {force: true});

            // * There should only be one result
            cy.get('.more-modal__row').
                as('result').
                its('length').
                should('equal', 1);

            // * Result should have appropriate text
            cy.get('@result').
                find('.more-modal__name').
                should('have.text', `@${thor.username} - ${thor.first_name} ${thor.last_name} (${thor.nickname})`);

            cy.get('@result').
                find('.more-modal__description').
                should('have.text', thor.email);

            // # Click on the result to add user
            cy.get('@result').click({force: true});

            // # Click on save
            cy.get('#saveItems').click();

            // # Should land on direct message channel for that user
            cy.get('#channelHeaderTitle').should('have.text', thor.username + ' ');
        });
    });
});
