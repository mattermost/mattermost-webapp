// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetRHS', (options = {visible: true}) => {
    if (options.visible) {
        return cy.get('#sidebar-right').should('be.visible');
    }

    return cy.get('#sidebar-right').should('not.be.visible');
});

Cypress.Commands.add('uiCloseRHS', () => {
    cy.findByLabelText('Close Sidebar Icon').click();
});

Cypress.Commands.add('uiExpandRHS', () => {
    cy.findByLabelText('Expand').click();
});

Cypress.Commands.add('isExpanded', {prevSubject: true}, (subject) => {
    return cy.get(subject).should('have.class', 'sidebar--right--expanded');
});

Cypress.Commands.add('uiAddComment', () => {
    cy.findByRole('button', {name: 'Add Comment'}).click();
});

// Sidebar search container

Cypress.Commands.add('uiGetRHSSearchContainer', (options = {visible: true}) => {
    if (options.visible) {
        return cy.get('#searchContainer').should('be.visible');
    }

    return cy.get('#searchContainer').should('not.exist');
});
