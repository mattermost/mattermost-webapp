// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 3]*/
/*eslint-disable func-names*/

import users from '../../fixtures/users.json';

const user = users['user-1'];
const sysadmin = users.sysadmin;

describe('System Console', () => {
    it('SC14734 Demoted user cannot continue to view System Console', () => {
        // 1. Login and navigate to the app as user
        cy.apiLogin(user.username);

        // 2. Get MMUSERID cookie to use userId later
        cy.getCookie('MMUSERID').as('userId');

        // 3. Set user to be a sysadmin, so it can access the system console
        cy.get('@userId').then((userId) => {
            cy.task('externalRequest', {user: sysadmin, method: 'put', path: `users/${userId.value}/roles`, data: {roles: 'system_user system_admin'}}).
                its('status').
                should('be.equal', 200);
        });

        // 4. Visit a page on the system console
        cy.visit('/admin_console/about/license');
        cy.get('#adminConsoleWrapper').should('be.visible');
        cy.url().should('include', '/admin_console/about/license');

        // 5. Change the role of the user back to user
        cy.get('@userId').then((userId) => {
            cy.task('externalRequest', {user: sysadmin, method: 'put', path: `users/${userId.value}/roles`, data: {roles: 'system_user'}}).
                its('status').
                should('be.equal', 200);
        });

        // 6. User should get redirected to town square
        cy.get('#adminConsoleWrapper').should('not.exist');
        cy.get('#postListContent').should('be.visible');
        cy.url().should('include', 'town-square');
    });
});
