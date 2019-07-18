// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const buttonTheme = {backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'rgb(255, 255, 255)'};

describe('System Console', () => {
    it('SC17020 - Revoke All Sessions from System Console', () => {
        // # Login as System Admin
        cy.apiLogin('sysadmin').as('sysadmin');

        cy.visit('/admin_console/user_management/users');

        // * Verify the presence of Revoke All Sessions button
        cy.get('#revoke-all-users').should('be.visible').and('have.css', 'background-color', buttonTheme.backgroundColor).
            and('have.css', 'color', buttonTheme.color);

        cy.get('#revoke-all-users').click();

        // * Verify the confirmation message when users clicks on the Revoke All Sessions button
        cy.get('.modal-title').should('be.visible').should('contain', 'Revoke all sessions in the system');
        cy.get('.modal-body').should('be.visible').should('contain', 'This action revokes all sessions in the system. All users will be logged out from all devices. Are you sure you want to revoke all sessions?');
        cy.get('#confirmModalButton').should('be.visible').should('have.class', 'btn-danger');

        // # Click on Cancel button in the confirmation message
        cy.get('.modal-footer .btn-cancel').click();

        // * Verify if Confirmation message is closed and session is still active
        cy.get('.modal-title').should('not.be.visible');
        cy.get('.modal-body').should('not.be.visible');
        cy.visit('/admin_console/user_management/users');
        cy.get('#revoke-all-users').should('be.visible');

        // # Click on the Revoke All Sessions button and confirm
        cy.get('#revoke-all-users').click();
        cy.get('#confirmModalButton').click();

        // * Verify if Admin User's session is expired and is redirected to login page
        cy.get('#login_section').should('be.visible');
    });
});
