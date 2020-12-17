// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiSave', () => {
    return cy.findByRole('button', {name: 'Save'}).click();
});

Cypress.Commands.add('uiCancel', () => {
    return cy.findByRole('button', {name: 'Cancel'}).click();
});

Cypress.Commands.add('uiClose', () => {
    return cy.findByRole('button', {name: 'Close'}).click();
});

Cypress.Commands.add('uiSaveAndClose', () => {
    cy.uiSave();
    cy.uiClose();
});
