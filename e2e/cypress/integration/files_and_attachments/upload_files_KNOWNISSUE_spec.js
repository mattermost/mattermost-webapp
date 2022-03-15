// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @files_and_attachments

import * as TIMEOUTS from '../../fixtures/timeouts';

import {
    downloadAttachmentAndVerifyItsProperties,
    interceptFileUpload,
    waitUntilUploadComplete,
} from './helpers';

describe('Upload Files', () => {
    let channelUrl;

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Init setup
        cy.apiInitSetup().then((out) => {
            channelUrl = out.channelUrl;

            cy.visit(channelUrl);
            interceptFileUpload();
        });
    });

    it('MM-T2261 Upload SVG and post -- KNOWN ISSUE: MM-38982', () => {
        const filename = 'svg.svg';
        const aspectRatio = 1;

        cy.visit(channelUrl);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Attach file
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(filename);
        waitUntilUploadComplete();

        cy.get('#create_post').find('.file-preview').within(() => {
            // * Filename is correct
            cy.get('.post-image__name').should('contain.text', filename);

            // * Type is correct
            cy.get('.post-image__type').should('contain.text', 'SVG');

            // * Size is correct
            cy.get('.post-image__size').should('contain.text', '6KB');

            // * Img thumbnail exist
            cy.get('.post-image__thumbnail > img').should('exist');
        });

        // # Post message
        cy.postMessage('hello');
        cy.uiWaitUntilMessagePostedIncludes('hello');

        // # Open file preview
        cy.uiGetFileThumbnail(filename).click();

        // * Verify image preview modal is opened
        cy.uiGetFilePreviewModal().within(() => {
            cy.uiGetContentFilePreviewModal().find('img').should((img) => {
                // * Image aspect ratio is maintained
                expect(img.width() / img.height()).to.be.closeTo(aspectRatio, 1);
            });

            // * Download button should exist
            cy.uiGetDownloadFilePreviewModal().then((downloadLink) => {
                expect(downloadLink.attr('download')).to.equal(filename);

                const fileAttachmentURL = downloadLink.attr('href');

                // * Verify that download link has correct name
                downloadAttachmentAndVerifyItsProperties(fileAttachmentURL, filename, 'attachment');
            });

            // # Close modal
            cy.uiCloseFilePreviewModal();
        });
    });
});

