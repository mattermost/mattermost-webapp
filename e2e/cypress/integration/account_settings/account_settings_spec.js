// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @account_settings

describe('Account Settings', () => {
    before(() => {
        // # Login as new user and visit off-topic
        cy.apiInitSetup({loginAfter: true}).then(({offTopicUrl}) => {
            cy.visit(offTopicUrl);
        });
    });

    it('MM-T2049 Account Settings link in own popover', () => {
        // # Click avatar to open profile popover
        cy.get('div.status-wrapper').should('be.visible').click();

        // # Click account settings link
        cy.get('#accountSettings').should('be.visible').click();

        // # Check if account settings modal is open
        cy.get('#accountSettingsModal').should('be.visible');

        cy.uiClose();
    });

    it('MM-T2081 Password: Error on blank', () => {
        // # Go to Account Settings
        cy.uiOpenAccountSettingsModal('Security');

        // * Check that the Security tab is loaded
        cy.get('#securityButton').should('be.visible');

        // # Click the Security tab
        cy.get('#securityButton').click();

        // # Click "Edit" to the right of "Password"
        cy.get('#passwordEdit').should('be.visible').click();

        // # Save the settings
        cy.uiSave();

        // * Check that there is an error
        cy.get('#clientError').should('be.visible').should('contain', 'Please enter your current password.');
        cy.get('#serverError').should('not.exist');
    });
});
