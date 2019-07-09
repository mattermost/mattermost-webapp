// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';
import * as TIMEOUTS from '../../fixtures/timeouts';

const sysadmin = users.sysadmin;

describe('System Console', () => {
    it('SC14734 Demoted user cannot continue to view System Console', () => {
        const baseUrl = Cypress.config('baseUrl');

        // # Login as new user
        cy.loginAsNewUser().as('newuser');

        // # Set user to be a sysadmin, so it can access the system console
        cy.get('@newuser').then((user) => {
            cy.externalRequest({user: sysadmin, method: 'put', baseUrl, path: `users/${user.id}/roles`, data: {roles: 'system_user system_admin'}});
        });

        // # Visit a page on the system console
        cy.visit('/admin_console/reporting/system_analytics');
        cy.get('#adminConsoleWrapper').should('be.visible');
        cy.url().should('include', '/admin_console/reporting/system_analytics');

        // # Change the role of the user back to user
        cy.get('@newuser').then((user) => {
            cy.externalRequest({user: sysadmin, method: 'put', baseUrl, path: `users/${user.id}/roles`, data: {roles: 'system_user'}});
        });

        // # User should get redirected to town square
        cy.get('#adminConsoleWrapper').should('not.exist');
        cy.get('#postListContent', {timeout: TIMEOUTS.LARGE}).should('be.visible');
        cy.url().should('include', 'town-square');
    });
});
