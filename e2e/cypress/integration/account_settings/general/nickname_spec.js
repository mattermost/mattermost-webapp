// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Account Settings > Sidebar > General', () => {
    before(() => {
        // # Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');
    });

    it('Nickname should render in before clicking edit', () => {
        // # Check that the General tab is loaded and click it
        cy.get('#generalButton').should('be.visible');
        cy.get('#generalButton').click();

        // * Check if element is present before nickname is set and contains expected text values
        cy.get('#generalSettingsTitle').should('be.visible').should('contain', 'General Settings');
        cy.get('#nicknameTitle').should('be.visible').should('contain', 'Nickname');
        cy.get('#nicknameDesc').should('be.visible').should('contain', "Click 'Edit' to add a nickname");
        cy.get('#nicknameEdit').should('be.visible').should('contain', 'Edit');
        cy.get('#accountSettingsHeader > .close').should('be.visible');
    });

    it('Nickname should render after clicking edit', () => {
        // # Click "Edit" to the right of "Nickname"
        cy.get('#nicknameEdit').click();

        // * Check elements after clicking 'Edit'
        cy.get('#generalSettingsTitle').should('be.visible').should('contain', 'General Settings');
        cy.get('#settingTitle').should('be.visible').should('contain', 'Nickname');
        cy.get('#nickname').should('be.visible');
        cy.get('#saveSetting').should('be.visible').should('contain', 'Save');
        cy.get('#cancelSetting').should('be.visible').should('contain', 'Cancel');
        cy.get('#accountSettingsHeader > .close').should('be.visible');
    });

    it('No nickname is present', () => {
        // # Clear the nickname text field contents
        cy.get('#nickname').clear();
        cy.get('#saveSetting').click();

        cy.get('#nicknameDesc').should('be.visible').should('contain', "Click 'Edit' to add a nickname");

        // # Open manage/view members
        cy.toAccountSettingsModal('user-1', true);
        cy.get('#accountSettingsHeader > .close').click();
        cy.get('#sidebarHeaderDropdownButton').click();

        cy.get('#viewMembers').should('be.visible');
        cy.get('#viewMembers').click();

        // # Search for username and check that no nickname is present
        cy.get('.modal-title').should('be.visible');
        cy.get('#searchUsersInput').should('be.visible').type('Victor Welch');
        cy.get('.more-modal__details > .more-modal__name').should('be.visible').should('contain', '@user-1 - Victor Welch');
    });

    it('AS13279 Account Settings > Add Nickname', () => {
        // # Go to  Account Settings view
        cy.toAccountSettingsModal('user-1', true);

        // # Click the General tab
        cy.get('#generalButton').should('be.visible');
        cy.get('#generalButton').click();

        // # Add the nickname to textfield contents
        cy.get('#nicknameEdit').click();
        cy.get('#nickname').clear();
        cy.get('#nickname').type('victor_nick');
        cy.get('#saveSetting').click();

        // * Check if element is present and contains expected text values
        cy.get('#nicknameDesc').should('be.visible').should('contain', 'victor_nick');

        // # Open manage memebers
        cy.toAccountSettingsModal('user-1', true);
        cy.get('#accountSettingsHeader > .close').click();
        cy.get('#sidebarHeaderDropdownButton').click();

        cy.get('#viewMembers').should('be.visible');
        cy.get('#viewMembers').click();

        // # Search for username and check that expected nickname is present
        cy.get('.modal-title').should('be.visible');
        cy.get('#searchUsersInput').should('be.visible').type('Victor Welch');
        cy.get('.more-modal__details > .more-modal__name').should('be.visible').should('contain', '@user-1 - Victor Welch (victor_nick)');
    });

    it('Clear the nickname', () => {
        // # Clear the set nickname
        cy.toAccountSettingsModal('user-1', true);

        cy.get('#generalButton').should('be.visible');
        cy.get('#generalButton').click();

        cy.get('#nicknameEdit').click();
        cy.get('#nickname').clear();
        cy.get('#saveSetting').click();

        cy.get('#nicknameDesc').should('be.visible').should('contain', "Click 'Edit' to add a nickname");
    });
});
