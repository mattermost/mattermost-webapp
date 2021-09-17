// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetRHS', (options = {exist: true}) => {
    if (options.exist) {
        return cy.get('#rhsContainer').should('be.visible');
    }

    return cy.get('#rhsContainer').should('not.exist');
});
