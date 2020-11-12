// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @account_setting

describe('Account Settings > Sidebar > General > Edit', () => {
    let testTeam;
    let testChannel;
    let otherUser;

    before(() => {
        // # Login as admin and visit town-square
        cy.apiInitSetup().then(({team, channel}) => {
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

    //Note: the test case mentions an error message that could not be found in the codebase: "This username is already taken. Please choose another." Added a note to the testcase to update the error message.
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
            // # Clear then type @
            cy.get('#post_textbox').should('be.visible').clear().type('@');

            // * Verify that the suggestion list is visible
            cy.get('#suggestionList').should('be.visible');

            // # Type user name
            cy.get('#post_textbox').type(newTempUserName);
            cy.get('#post_textbox').type('{enter}{enter}');

            // # Check that the user name has been posted
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).should('contain', newTempUserName);
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
});
