// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('SC17020 - Revoke All Sessions from System Console', () => {
    it('Verify for System Admin', () => {
        // # Login as System Admin
        cy.apiLogin('sysadmin');

        cy.visit('/admin_console/user_management/users');

        // * Verify the presence of Revoke All Sessions button
        cy.get('#revoke-all-users').should('be.visible').and('not.have.class', 'btn-danger').click();

        // * Verify the confirmation message when users clicks on the Revoke All Sessions button
        cy.get('#confirmModalLabel').should('be.visible').and('have.text', 'Revoke all sessions in the system');
        cy.get('.modal-body').should('be.visible').and('have.text', 'This action revokes all sessions in the system. All users will be logged out from all devices. Are you sure you want to revoke all sessions?');
        cy.get('#confirmModalButton').should('be.visible').and('have.class', 'btn-danger');

        // # Click on Cancel button in the confirmation message
        cy.get('#cancelModalButton').click();

        // * Verify if Confirmation message is closed
        cy.get('#confirmModal').should('not.exist');

        // * Verify if the Admin's session is still active and user is still in the same page
        cy.url().should('contain', '/admin_console/user_management/users');

        // * Verify if the Admin's Session is still active and click on it and then confirm
        cy.get('#revoke-all-users').should('be.visible').click();
        cy.get('#confirmModalButton').click();

        // * Verify if Admin User's session is expired and is redirected to login page
        cy.url({timeout: TIMEOUTS.LARGE}).should('include', '/login');
        cy.get('#login_section', {timeout: TIMEOUTS.LARGE}).should('be.visible');
    });

    it('Verify for Regular Member', () => {
        // # Login as a regular member and navigate to Town Square Chat channel
        cy.apiLogin('user-1');
        cy.visit('/');
        cy.get('#sidebarItem_town-square').click();

        // # Issue a Request to Revoke All Sessions as SysAdmin
        const baseUrl = Cypress.config('baseUrl');
        cy.externalRequest({user: users.sysadmin, method: 'post', baseUrl, path: 'users/sessions/revoke/all'}).then(() => {
            // * Verify if the regular member is logged out and redirected to login page
            cy.url({timeout: TIMEOUTS.LARGE}).should('include', '/login');
            cy.get('#login_section', {timeout: TIMEOUTS.LARGE}).should('be.visible');
        });
    });
});
