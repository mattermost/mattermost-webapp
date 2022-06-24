// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

function uiLogin(user = {} as {email: string; password: string;}): ChainableT<void> {
    cy.url().should('include', '/login');

    // # Type email and password, then Sign in
    cy.get('#input_loginId').should('be.visible').type(user.email);
    cy.get('#input_password-input').should('be.visible').type(user.password);
    cy.get('#saveSetting').should('not.be.disabled').click();
    return;
}
Cypress.Commands.add('uiLogin', uiLogin);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Login vi UI at login page
             *
             * @param {UserProfile} user - user with username and password
             *
             * @example
             *   cy.uiLogin(user);
             */
            uiLogin(user: UserProfile): Chainable;
        }
    }
}
