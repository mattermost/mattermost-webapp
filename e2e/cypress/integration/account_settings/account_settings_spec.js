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

            // # Go to Account Settings
            cy.uiOpenAccountSettingsModal('Security');

            // * Check that the Security tab is loaded
            cy.get('#securityButton').should('be.visible');

            // # Click the Security tab
            cy.get('#securityButton').click();
        });
    });

    it('MM-T2081 Password: Error on blank', () => {
        // # Click "Edit" to the right of "Password"
        cy.get('#passwordEdit').should('be.visible').click();

        // # Save the settings
        cy.uiSave();

        // * Check that there are no errors
        cy.get('#clientError').should('be.visible').should('contain', 'Please enter your current password.');
        cy.get('#serverError').should('not.exist');
    });
});
