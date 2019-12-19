// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('System Console', () => {
    it('MM-20646 - System Admin can map roles to groups from Channel Configuration screen', () => {
        cy.apiLogin('sysadmin');

        // # Go to system admin page
        cy.visit('/admin_console/user_management/channels');
        cy.findByTestId('autemedit').click()
        cy.findByTestId('add-group').click()
        cy.get('#multiSelectList').first().click()
        cy.get('#saveItems').click()
        cy.get('#saveSetting').click()
        cy.findByTestId('current-role').click()
        cy.get('#role-to-be').click()
        cy.get('#saveSetting').click()
        cy.reload()
        cy.findByTestId('current-role').should('have.text', 'Channel Admin')

    });
});
