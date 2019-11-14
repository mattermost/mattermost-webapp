// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('System Console', () => {
    it('MM-19309 Allow System Admins to control Teammate Name Display at the system level', () => {
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/site_config/users_and_teams');
        cy.findByTestId('TeamSettings.TeammateNameDisplaydropdown').select('nickname_full_name');
        cy.findByTestId('TeamSettings.LockTeammateNameDisplayfalse').click();
        cy.get('#saveSetting').click();

        cy.visit('/');
        cy.toAccountSettingsModal(null, true);
        cy.get('#displayButton').click();
        cy.get('#name_formatEdit').click();
        cy.get('#name_formatFormatC').check();
        cy.get('#saveSetting').click();
        cy.get('#name_formatDesc').contains('Show first and last name').should('be.visible');

        cy.visit('/admin_console/site_config/users_and_teams');
        cy.findByTestId('TeamSettings.TeammateNameDisplaydropdown').select('username');
        cy.findByTestId('TeamSettings.LockTeammateNameDisplaytrue').click();
        cy.get('#saveSetting').click();

        cy.visit('/');
        cy.toAccountSettingsModal(null, true);
        cy.get('#displayButton').click();
        cy.get('#name_formatDesc').contains('Show username').should('be.visible');
        cy.get('#name_formatEdit').click();
        cy.get('#extraInfo').contains('This field is handled through your System Administrator. If you want to change it, you need to do so through your System Administrator.').should('be.visible');
    });
});
