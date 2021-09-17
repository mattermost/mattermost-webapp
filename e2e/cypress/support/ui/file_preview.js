// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetFileThumbnail', (filename) => {
    return cy.findByLabelText(`file thumbnail ${filename.toLowerCase()}`);
});

Cypress.Commands.add('uiGetFilePreview', () => {
    return cy.get('.file-preview-modal').should('be.visible');
});

Cypress.Commands.add('uiGetFilePreviewHeader', () => {
    return cy.uiGetFilePreview().find('.file-preview-modal-header').should('be.visible');
});

Cypress.Commands.add('uiOpenFilePreview', (filename) => {
    if (filename) {
        cy.uiGetFileThumbnail(filename.toLowerCase()).click();
    } else {
        cy.findByTestId('fileAttachmentList').children().first().click();
    }
});

Cypress.Commands.add('uiCloseFilePreview', () => {
    return cy.uiGetFilePreview().find('.icon-close').click();
});
