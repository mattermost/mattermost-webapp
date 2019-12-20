// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('System Console', () => {
    it('MM-20059 - System Admin can map roles to groups from Team Configuration screen', () => {
        cy.apiLogin('sysadmin');

        // # Go to system admin page and to team configuration page of channel "eligendi"
        cy.visit('/admin_console/user_management/teams');
        cy.findByTestId('eligendiedit').click();

        // # Wait until the groups retrieved and show up
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Remove all exisiting groups
        cy.get('#groups-list--body').then((el) => {
            if (el[0].childNodes[0].innerText !== 'No groups specified yet') {
                for (let i = 0; i < el[0].childNodes.length; i++) {
                    cy.get('#group-actions').click();
                }

                // # Save the setting
                cy.get('#saveSetting').click();
            }
        });

        // # Add the first group in the group list then save
        cy.findByTestId('add-group').click();
        cy.get('#multiSelectList').first().click();
        cy.get('#saveItems').click();
        cy.get('#saveSetting').click();

        // # Change the role from member to Channel Admin
        cy.findByTestId('current-role').click();
        cy.get('#role-to-be').click();
        cy.get('#saveSetting').click();

        // # Reload to ensure it's been saved
        cy.reload();

        // * Check to make the the current role text is displayed as Team Admin
        cy.findByTestId('current-role').should('have.text', 'Team Admin');
    });

    it('MM-20646 - System Admin can map roles to groups from Channel Configuration screen', () => {
        cy.apiLogin('sysadmin');

        // # Go to system admin page and to channel configuration page of channel "autem"
        cy.visit('/admin_console/user_management/channels');
        cy.findByTestId('autemedit').click();

        // # Wait until the groups retrieved and show up
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Remove all exisiting groups
        cy.get('#groups-list--body').then((el) => {
            if (el[0].childNodes[0].innerText !== 'No groups specified yet') {
                for (let i = 0; i < el[0].childNodes.length; i++) {
                    cy.get('#group-actions').click();
                }

                // # Save the setting
                cy.get('#saveSetting').click();
            }
        });

        // # Add the first group in the group list then save
        cy.findByTestId('add-group').click();
        cy.get('#multiSelectList').first().click();
        cy.get('#saveItems').click();
        cy.get('#saveSetting').click();

        // # Change the role from member to Channel Admin
        cy.findByTestId('current-role').click();
        cy.get('#role-to-be').click();
        cy.get('#saveSetting').click();

        // # Reload to ensure it's been saved
        cy.reload();

        // * Check to make the the current role text is displayed as Channel Admin
        cy.findByTestId('current-role').should('have.text', 'Channel Admin');
    });
});
