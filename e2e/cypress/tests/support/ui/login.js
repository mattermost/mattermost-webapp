// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiLogin', (user = {}) => {
    cy.url().should('include', '/login');

    // # Type email and password, then Sign in
    cy.get('#loginId').should('be.visible').type(user.email);
    cy.get('#loginPassword').should('be.visible').type(user.password);
    cy.findByText('Sign in').click();
});
