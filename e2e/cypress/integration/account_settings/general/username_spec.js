// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import {getRandomId} from '../../../utils';
import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Account Settings > Sidebar > General > Edit', () => {
    let testTeam;
    let testUser;
    let testChannel;
    let otherUser;

    before(() => {
        // # Login as admin and visit town-square
        cy.apiInitSetup().then(({user, team, channel}) => {
            testUser = user;
            testTeam = team;
            testChannel = channel;

            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });

            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    beforeEach(() => {
        // # Go to Account Settings
        cy.toAccountSettingsModal();
    });

    it('MM-T2050 Username cannot be blank', () => {
        // # Click the General tab
        cy.get('#generalButton').should('be.visible').click();

        // # Clear the username textfield contents
        cy.get('#usernameEdit').click();
        cy.get('#username').clear();
        cy.get('#saveSetting').click();

        // * Check if element is present and contains expected text values
        cy.get('#clientError').should('be.visible').should('contain', 'Username must begin with a letter, and contain between 3 to 22 lowercase characters made up of numbers, letters, and the symbols \'.\', \'-\', and \'_\'.');

        // # Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();
    });

    it('MM-T2051 Username min 3 characters', () => {
        // # Click the General tab
        cy.get('#generalButton').should('be.visible').click();

        // # Edit the username field
        cy.get('#usernameEdit').click();

        // # Add the username to textfield contents
        cy.get('#username').clear().type('te');
        cy.get('#saveSetting').click();

        // * Check if element is present and contains expected text values
        cy.get('#clientError').should('be.visible').should('contain', 'Username must begin with a letter, and contain between 3 to 22 lowercase characters made up of numbers, letters, and the symbols \'.\', \'-\', and \'_\'.');

        // # Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();
    });

    it('MM-T2052 Username already taken', () => {
        // # Click the General tab
        cy.get('#generalButton').should('be.visible').click();

        // # Edit the username field
        cy.get('#usernameEdit').click();

        // # Add the username to textfield contents
        cy.get('#username').clear().type(`${otherUser.username}`);
        cy.get('#saveSetting').click();

        // * Check if element is present and contains expected text values
        cy.get('#serverError').should('be.visible').should('contain', 'Unable to find the existing account to update.');

        // # Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();
    });

    it('MM-T2053 Username w/ dot, dash, underscore still searches', () => {
        let tempUser;

        // # Create a temporary user
        cy.apiCreateUser({prefix: 'temp'}).then(({user: user1}) => {
            tempUser = user1;

            cy.apiAddUserToTeam(testTeam.id, tempUser.id).then(() => {
                cy.apiAddUserToChannel(testChannel.id, tempUser.id);
            });

            // # Login the temporary user
            cy.apiLogin(tempUser);
            cy.visit(`/${testTeam.name}/channels/town-square`);
            cy.toAccountSettingsModal();

            // # Step 1
            // # Click the General tab
            cy.get('#generalButton').should('be.visible').click();

            // # Edit the username field
            cy.get('#usernameEdit').click();

            // # Step 2
            // # Add the username to textfield contents
            const newTempUserName = 'a-' + tempUser.username;
            cy.get('#username').clear().type(newTempUserName);
            cy.get('#saveSetting').click();

            // * Check that we return to the Account Settings panel
            cy.get('#generalButton').should('be.visible');

            // # Click "x" button to close Account Settings modal
            cy.get('#accountSettingsHeader > .close').click();

            // # Step 3
            // * Verify that we've logged in as the temp user
            cy.visit(`/${testTeam.name}/channels/town-square`);
            cy.get('#headerUsername').should('contain', '@' + newTempUserName);

            // # Step 4
            const text = `${newTempUserName} test message!`;

            // # Post the user name mention declared earlier
            cy.postMessage(`${text}{enter}{enter}`);

            // # Click on the @ button
            cy.get('#channelHeaderMentionButton', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').click();

            // * Ensure that the user's name is in the search box after clicking on the @ button
            cy.get('#searchBox').should('be.visible').and('have.value', `@${newTempUserName} `);
            cy.get('#search-items-container').should('be.visible').within(() => {
                // * Ensure that the mentions are visible in the RHS
                cy.findByText(`${newTempUserName}`).should('be.visible');
                cy.findByText(`${newTempUserName} test message!`).should('be.visible');
            });
        });
    });

    it('MM-T2054 Username cannot start with dot, dash, or underscore', () => {
        // # Click the General tab
        cy.get('#generalButton').should('be.visible').click();

        // # Edit the username field
        cy.get('#usernameEdit').click();

        const prefixes = [
            '.',
            '-',
            '_',
        ];

        for (const prefix of prefixes) {
            // # Add  username to textfield contents
            cy.get('#username').clear().type(prefix).type('{backspace}.').type(`${otherUser.username}`);
            cy.get('#saveSetting').click();

            // * Check if element is present and contains expected text values
            cy.get('#clientError').should('be.visible').should('contain', 'Username must begin with a letter, and contain between 3 to 22 lowercase characters made up of numbers, letters, and the symbols \'.\', \'-\', and \'_\'.');
        }

        // # Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();
    });

    it('MM-T2055 Usernames that are reserved', () => {
        // # Click the General tab
        cy.get('#generalButton').should('be.visible').click();

        // # Edit the username field
        cy.get('#usernameEdit').click();

        const usernames = [
            'all',
            'channel',
            'here',
            'matterbot',
        ];

        for (const username of usernames) {
            // # Add  username to textfield contents
            cy.get('#username').clear().type(username);
            cy.get('#saveSetting').click();

            // * Check if element is present and contains expected text values
            cy.get('#clientError').should('be.visible').should('contain', 'This username is reserved, please choose a new one.');
        }

        // # Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();
    });

    it('MM-T2056 Username changes when viewed by other user', () => {
        cy.apiLogout().wait(TIMEOUTS.ONE_SEC).then(() => {
            cy.apiLogin(testUser).then(() => {
                cy.visit(`/${testTeam.name}/channels/town-square`);

                // # Post a message in town-square
                cy.postMessage('Testing username update');
                cy.apiLogout().wait(TIMEOUTS.ONE_SEC).then(() => {
                    // # Login as other user
                    cy.apiLogin(otherUser).then(() => {
                        cy.visit(`/${testTeam.name}/channels/town-square`);

                        // # get last post in town-square for verifying username
                        cy.getLastPostId().then((postId) => {
                            cy.get(`#post_${postId}`).within(() => {
                                // # Open profile popover
                                cy.get('.user-popover').click();
                            });

                            // * Verify username in profile popover
                            cy.get('#user-profile-popover').within(() => {
                                cy.get('.user-popover__username').should('be.visible').and('contain', `${testUser.username}`);
                            });
                        });

                        cy.apiLogout().wait(TIMEOUTS.ONE_SEC).then(() => {
                            // # Login as test user
                            cy.apiLogin(testUser).then(() => {
                                cy.visit(`/${testTeam.name}/channels/town-square`);

                                // # Open account settings modal
                                cy.toAccountSettingsModal();

                                // # Open Full Name section
                                cy.get('#usernameDesc').click();

                                const randomId = getRandomId();

                                // # Save username with a randomId
                                cy.get('#username').clear().type(`${otherUser.username}-${randomId}`);

                                // # save form
                                cy.get('#saveSetting').click();

                                cy.apiLogout().wait(TIMEOUTS.ONE_SEC).then(() => {
                                    cy.apiLogin(otherUser).then(() => {
                                        cy.visit(`/${testTeam.name}/channels/town-square`);

                                        // # get last post in town-square for verifying username
                                        cy.getLastPostId().then((postId) => {
                                            cy.get(`#post_${postId}`).within(() => {
                                                cy.get('.user-popover').click();
                                            });

                                            // * Verify that new username is in profile popover
                                            cy.get('#user-profile-popover').within(() => {
                                                cy.get('.user-popover__username').should('be.visible').and('contain', `${otherUser.username}-${randomId}`);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
