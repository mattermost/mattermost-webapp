// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetRHS', (options = {exist: true}) => {
    if (options.exist) {
        return cy.get('#sidebar-right').should('be.visible');
    }

    return cy.get('#sidebar-right').should('not.exist');
});

Cypress.Commands.add('uiCloseRHS', () => {
    cy.get('#rhsCloseButton').should('be.visible').click();
});

Cypress.Commands.add('uiExpandRHS', () => {
    cy.findByLabelText('Expand').click();
});

Cypress.Commands.add('isExpanded', {prevSubject: true}, (subject) => {
    return cy.get(subject).should('have.class', 'sidebar--right--expanded');
});
