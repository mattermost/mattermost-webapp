// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

describe('Cookie with Subpath', () => {
    before(() => {
        // # Logout to remove whitelisted cookies
        cy.apiLogout();
    });

    it('should generate cookie with subpath', () => {
        const user = users['user-1'];

        cy.getSubpath().then((subpath) => {
            // * Check login page is loaded
            cy.get('#login_section').should('be.visible');

            // # Login as user-1
            cy.get('#loginId').should('be.visible').type(user.username);
            cy.get('#loginPassword').should('be.visible').type(user.password);
            cy.get('#loginButton').should('be.visible').click();

            // * Check login success
            cy.get('#channel_view').should('be.visible');

            // * Check subpath included in url
            cy.url().should('include', subpath);
            cy.url().should('include', '/channels/town-square');

            // * Check cookies have correct path parameter
            cy.getCookies().should('have.length', 3).each((cookie) => {
                if (subpath) {
                    expect(cookie).to.have.property('path', subpath);
                } else {
                    expect(cookie).to.have.property('path', '/');
                }
            });
        });
    });
});
