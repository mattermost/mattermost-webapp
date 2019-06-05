// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 5]*/
/*eslint-disable func-names*/

import users from '../../fixtures/users.json';

const sysadmin = users.sysadmin;

describe('System Console', () => {
    it('User can change minimum username length', () => {
        // # Login as new user
        cy.loginAsNewUser().as('user-1');

        // # Set user to be a sysadmin, so it can access the system console
        cy.get('@user-1').then((user) => {
            cy.task('externalRequest', {user: sysadmin, method: 'put', path: `users/${user.id}/roles`, data: {roles: 'system_user system_admin'}}).
                its('status').
                should('be.equal', 200);
        });

        // # Visit system console
        cy.visit('/admin_console/site_config/users_and_teams');
        cy.get('input[id="ServiceSettings.MinimumUsernameLength"]').clear().type(2);
        cy.get('#saveSetting').click();

        cy.visit('/');

        cy.toAccountSettingsModal('user-1', true);
        cy.get('#usernameTitle').click();
        cy.get('input[id="username"]').clear().type('ab');
        cy.get('#saveSetting').click();
        cy.get('#clientError').should('not.be.visible');
    });

    it('User can\'t bypass minimum username length', () => {
        // # Login as new user
        cy.loginAsNewUser().as('user-1');

        // # Set user to be a sysadmin, so it can access the system console
        cy.get('@user-1').then((user) => {
            cy.task('externalRequest', {user: sysadmin, method: 'put', path: `users/${user.id}/roles`, data: {roles: 'system_user system_admin'}}).
                its('status').
                should('be.equal', 200);
        });

        // # Visit system console
        cy.visit('/admin_console/site_config/users_and_teams');
        cy.get('input[id="ServiceSettings.MinimumUsernameLength"]').clear().type(2);
        cy.get('#saveSetting').click();

        cy.visit('/');

        cy.toAccountSettingsModal('user-1', true);
        cy.get('#usernameTitle').click();
        cy.get('input[id="username"]').clear().type('a');
        cy.get('#saveSetting').click();
        cy.get('#clientError').should('be.visible');
    });
});
