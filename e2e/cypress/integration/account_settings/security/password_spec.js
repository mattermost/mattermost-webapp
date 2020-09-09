// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Account Settings -> Security -> Password', () => {
    before(() => {
        // # Login as new user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    beforeEach(() => {
        // # Go to Account Settings
        cy.toAccountSettingsModal();

        // * Check that the Security tab is loaded
        cy.get('#securityButton').should('be.visible');

        // # Click the Security tab
        cy.get('#securityButton').click();
    });

    it('MM-T2085 Password: Valid values in password change fields allow the form to save successfully', () => {
        // # Click "Edit" to the right of "Password"
        cy.get('#passwordEdit').should('be.visible').click();

        // # Type the same password
        cy.get('#currentPassword').should('be.visible').type('passwd');
        cy.get('#newPassword').should('be.visible').type('passwd');
        cy.get('#confirmPassword').should('be.visible').type('passwd');

        // # Save the settings
        cy.get('#saveSetting').click().wait(TIMEOUTS.HALF_SEC);

        // * Check that there are no errors
        cy.get('#clientError').should('not.exist');
        cy.get('#serverError').should('not.exist');
    });
});
