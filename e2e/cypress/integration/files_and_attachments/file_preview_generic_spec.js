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
    attachFile,
    downloadAttachmentAndVerifyItsProperties,
    waitUntilUploadComplete,
} from './helpers';

describe('Upload Files - Generic', () => {
    let testTeam;

    before(() => {
        // # Create new team and new user and visit test channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            testTeam = team;

            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.postMessage('hello');
        });
    });

    it('MM-T3824_1 - PDF', () => {
        const properties = {
            filePath: 'mm_file_testing/Documents/PDF.pdf',
            fileName: 'PDF.pdf',
            mimeType: 'application/pdf',
            type: 'pdf',
        };
        testGenericFile(properties);
    });

    it('MM-T3824_2 - Excel', () => {
        const properties = {
            filePath: 'mm_file_testing/Documents/Excel.xlsx',
            fileName: 'Excel.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            type: 'excel',
        };
        testGenericFile(properties);
    });

    it('MM-T3824_3 - PPT', () => {
        const properties = {
            filePath: 'mm_file_testing/Documents/PPT.pptx',
            fileName: 'PPT.pptx',
            mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            type: 'ppt',
        };
        testGenericFile(properties);
    });

    it('MM-T3824_4 - Word', () => {
        const properties = {
            filePath: 'mm_file_testing/Documents/Word.docx',
            fileName: 'Word.docx',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            type: 'word',
        };
        testGenericFile(properties);
    });

    it('MM-T3824_5 - Text', () => {
        const properties = {
            filePath: 'mm_file_testing/Documents/Text.txt',
            fileName: 'Text.txt',
            mimeType: 'txt/plain',
            type: 'text',
        };
        testGenericFile(properties);
    });
});

function testGenericFile(properties) {
    const {fileName, type} = properties;

    // # Post any message
    cy.postMessage(fileName);

    // # Post an image in center channel
    attachFile(properties);

    // # Wait until file upload is complete then submit
    waitUntilUploadComplete(`div.${type}`);
    cy.postMessage('{enter}');
    cy.wait(TIMEOUTS.ONE_SEC);

    cy.getLastPost().within(() => {
        cy.get('.post-image__thumbnail').within(() => {
            // * File is posted
            cy.get(`.file-icon.${type}`).should('exist').click();
        });
    });

    cy.get('.modal-body').within(() => {
        switch (type) {
        case 'text':
            cy.get('.post-code').get('code').should('exist');
            break;
        case 'pdf':
            cy.get('.pdf').get('.post-code').get('canvas').should('have.length', 10);
            break;
        default:
        }

        // * No apparent way to check the thumbnail is the correct one.
        // # Hover over the image
        cy.get('.modal-image__content').trigger('mouseover');

        // * Download button should exist
        cy.findByText('Download').should('exist').parent().then((downloadLink) => {
            expect(downloadLink.attr('download')).to.equal(fileName);

            const fileAttachmentURL = downloadLink.attr('href');

            // * Verify that download link has correct name
            downloadAttachmentAndVerifyItsProperties(fileAttachmentURL, fileName, 'attachment');
        });

        // # Close modal
        cy.get('.modal-close').click();
    });
}
