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

Cypress.Commands.add('uiGetButton', (name) => {
    return cy.findByRole('button', {name}).should('be.visible');
});

Cypress.Commands.add('uiSaveButton', () => {
    return cy.uiGetButton('Save');
});

Cypress.Commands.add('uiCancelButton', () => {
    return cy.uiGetButton('Cancel');
});

Cypress.Commands.add('uiCloseButton', () => {
    return cy.uiGetButton('Close');
});

Cypress.Commands.add('uiGetRadioButton', (name) => {
    return cy.findByRole('radio', {name}).should('be.visible');
});

Cypress.Commands.add('uiGetHeading', (name) => {
    return cy.findByRole('heading', {name}).should('be.visible');
});

Cypress.Commands.add('uiGetTextbox', (name) => {
    return cy.findByRole('textbox', {name}).should('be.visible');
});
