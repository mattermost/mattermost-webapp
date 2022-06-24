// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

function uiGetFileThumbnail(filename: string): ChainableT<JQuery> {
    return cy.findByLabelText(`file thumbnail ${filename.toLowerCase()}`);
}
Cypress.Commands.add('uiGetFileThumbnail', uiGetFileThumbnail);

function uiGetFileUploadPreview(): ChainableT<JQuery> {
    return cy.get('.file-preview__container').should('be.visible');
}
Cypress.Commands.add('uiGetFileUploadPreview', uiGetFileUploadPreview);

function uiGetFilePreviewModal(options = {exist: true}): ChainableT<JQuery> {
    if (options.exist) {
        return cy.get('.file-preview-modal').should('be.visible');
    }

    return cy.get('.file-preview-modal').should('not.exist');
}
Cypress.Commands.add('uiGetFilePreviewModal', uiGetFilePreviewModal);

function uiGetPublicLink(options = {exist: true}): ChainableT<JQuery> {
    if (options.exist) {
        return cy.get('.icon-link-variant').should('be.visible');
    }
    return cy.get('.icon-link-variant').should('not.exist');
}
Cypress.Commands.add('uiGetPublicLink', uiGetPublicLink);

function uiGetHeaderFilePreviewModal(): ChainableT<JQuery> {
    return cy.uiGetFilePreviewModal().find('.file-preview-modal-header').should('be.visible');
}
Cypress.Commands.add('uiGetHeaderFilePreviewModal', uiGetHeaderFilePreviewModal);

function uiOpenFilePreviewModal(filename: string): ChainableT<void> {
    if (filename) {
        cy.uiGetFileThumbnail(filename.toLowerCase()).click();
    } else {
        cy.findByTestId('fileAttachmentList').children().first().click();
    }
    return;
}
Cypress.Commands.add('uiOpenFilePreviewModal', uiOpenFilePreviewModal);

function uiCloseFilePreviewModal(): ChainableT<JQuery> {
    return cy.uiGetFilePreviewModal().find('.icon-close').click();
}
Cypress.Commands.add('uiCloseFilePreviewModal', uiCloseFilePreviewModal);

function uiGetContentFilePreviewModal(): ChainableT<JQuery> {
    return cy.uiGetFilePreviewModal().find('.file-preview-modal__content');
}
Cypress.Commands.add('uiGetContentFilePreviewModal', uiGetContentFilePreviewModal);

function uiGetDownloadLinkFilePreviewModal(): ChainableT<JQuery> {
    return cy.uiGetFilePreviewModal().find('.icon-link-variant').parent();
}
Cypress.Commands.add('uiGetDownloadLinkFilePreviewModal', uiGetDownloadLinkFilePreviewModal);

function uiGetDownloadFilePreviewModal(): ChainableT<JQuery> {
    return cy.uiGetFilePreviewModal().find('.icon-download-outline').parent();
}
Cypress.Commands.add('uiGetDownloadFilePreviewModal', uiGetDownloadFilePreviewModal);

function uiGetArrowLeftFilePreviewModal(): ChainableT<JQuery> {
    return cy.uiGetFilePreviewModal().find('.icon-chevron-left').parent();
}
Cypress.Commands.add('uiGetArrowLeftFilePreviewModal', uiGetArrowLeftFilePreviewModal);

function uiGetArrowRightFilePreviewModal(): ChainableT<JQuery> {
    return cy.uiGetFilePreviewModal().find('.icon-chevron-right').parent();
}
Cypress.Commands.add('uiGetArrowRightFilePreviewModal', uiGetArrowRightFilePreviewModal);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Get file thumbnail from a post
             *
             * @param {string} filename
             *
             * @example
             *   cy.uiGetFileThumbnail('image.png');
             */
            uiGetFileThumbnail: typeof uiGetFileThumbnail;

            /**
             * Get file upload preview located below post textbox
             *
             * @example
             *   cy.uiGetFileUploadPreview();
             */
            uiGetFileUploadPreview: typeof uiGetFileUploadPreview;

            /**
             * Get file preview modal
             *
             * @param {bool} option.exist - Set to false to not verify if the element exists. Otherwise, true (default) to check existence.
             *
             * @example
             *   cy.uiGetFilePreviewModal();
             */
            uiGetFilePreviewModal: typeof uiGetFilePreviewModal;

            /**
             * Get Public Link
             *
             * @param {bool} option.exist - Set to false to not verify if the element exists. Otherwise, true (default) to check existence.
             *
             * @example
             *   cy.uiGetPublicLink();
             */
            uiGetPublicLink: typeof uiGetPublicLink;

            /**
             * Open file preview modal
             *
             * @param {string} filename
             *
             * @example
             *   cy.uiOpenFilePreviewModal('image.png');
             */
            uiOpenFilePreviewModal: typeof uiOpenFilePreviewModal;

            /**
             * Close file preview modal
             *
             * @example
             *   cy.uiCloseFilePreviewModal();
             */
            uiCloseFilePreviewModal(): Chainable;

            /**
             * Get main content of file preview modal
             *
             * @example
             *   cy.uiGetContentFilePreviewModal();
             */
            uiGetContentFilePreviewModal: typeof uiGetContentFilePreviewModal;

            /**
             * Get download link button from file preview modal
             *
             * @example
             *   cy.uiGetDownloadLinkFilePreviewModal();
             */
            uiGetDownloadLinkFilePreviewModal: typeof uiGetDownloadLinkFilePreviewModal;

            /**
             * Get download button from file preview modal
             *
             * @example
             *   cy.uiGetDownloadFilePreviewModal();
             */
            uiGetDownloadFilePreviewModal: typeof uiGetDownloadFilePreviewModal;

            /**
             * Get arrow left button from file preview modal
             *
             * @example
             *   cy.uiGetArrowLeftFilePreviewModal();
             */
            uiGetArrowLeftFilePreviewModal: typeof uiGetArrowLeftFilePreviewModal;

            /**
             * Get arrow right button from file preview modal
             *
             * @example
             *   cy.uiGetArrowRightFilePreviewModal();
             */
            uiGetArrowRightFilePreviewModal: typeof uiGetArrowRightFilePreviewModal;

            uiGetHeaderFilePreviewModal: typeof uiGetHeaderFilePreviewModal;
        }
    }
}
