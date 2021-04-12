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

describe('Upload Files - Video', () => {
    let testTeam;

    before(() => {
        // # Create new team and new user and visit test channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            testTeam = team;

            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.postMessage('hello');
        });
    });

    it('MM-T3826_1 - MP4', () => {
        const properties = {
            filePath: 'mm_file_testing/Video/MP4.mp4',
            fileName: 'MP4.mp4',
            shouldPreview: true,
        };
        testVideoFile(properties);
    });

    it('MM-T3826_2 - AVI', () => {
        const properties = {
            filePath: 'mm_file_testing/Video/AVI.avi',
            fileName: 'AVI.avi',
            mimeType: 'video/x-msvideo',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });

    it('MM-T3826_3 - MKV', () => {
        const properties = {
            filePath: 'mm_file_testing/Video/MKV.mkv',
            fileName: 'MKV.mkv',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });

    it('MM-T3826_4 - MOV', () => {
        const properties = {
            filePath: 'mm_file_testing/Video/MOV.mov',
            fileName: 'MOV.mov',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });

    it('MM-T3826_5 - MPG', () => {
        const properties = {
            filePath: 'mm_file_testing/Video/MPG.mpg',
            fileName: 'MPG.mpg',
            mimeType: 'video/mpeg',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });

    it('MM-T3826_6 - WEBM', () => {
        const properties = {
            filePath: 'mm_file_testing/Video/WEBM.webm',
            fileName: 'WEBM.webm',
            mimeType: 'video/webm',
            shouldPreview: true,
        };
        testVideoFile(properties);
    });

    it('MM-T3826_7 - WMV', () => {
        const properties = {
            filePath: 'mm_file_testing/Video/WMV.wmv',
            fileName: 'WMV.wmv',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });
});

export function testVideoFile(properties) {
    const {fileName, shouldPreview} = properties;

    // # Post any message
    cy.postMessage(fileName);

    // # Post an image in center channel
    attachFile(properties);

    // # Wait until file upload is complete then submit
    waitUntilUploadComplete('div.video');
    cy.postMessage('{enter}');
    cy.wait(TIMEOUTS.ONE_SEC);

    cy.getLastPost().within(() => {
        cy.get('.post-image__thumbnail').within(() => {
            // * File is posted
            cy.get('.file-icon.video').should('exist').click();
        });
    });

    cy.get('.modal-body').within(() => {
        if (shouldPreview) {
            // * Check if the video element exist
            cy.get('video').should('exist');
        }

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
