// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @files_and_attachments

import * as TIMEOUTS from '../../fixtures/timeouts';

import {downloadAttachmentAndVerifyItsProperties} from './helpers';

describe('Upload Files - Video', () => {
    let testTeam;

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;

            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        });
    });

    it('MM-T2264_12 - MP4', () => {
        const properties = {
            route: 'mm_file_testing/Video/MP4.mp4',
            shouldPreview: true,
        };
        testVideoFile(properties);
    });

    it('MM-T2264_13 - AVI', () => {
        const properties = {
            route: 'mm_file_testing/Video/AVI.avi',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });

    it('MM-T2264_14 - MKV', () => {
        const properties = {
            route: 'mm_file_testing/Video/MKV.mkv',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });

    it('MM-T2264_16 - MPG', () => {
        const properties = {
            route: 'mm_file_testing/Video/MPG.mpg',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });

    it('MM-T2264_17 - WEBM', () => {
        const properties = {
            route: 'mm_file_testing/Video/WEBM.webm',
            shouldPreview: true,
        };
        testVideoFile(properties);
    });

    it('MM-T2264_18 - WMV', () => {
        const properties = {
            route: 'mm_file_testing/Video/WMV.wmv',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });
});

function testVideoFile(fileProperties) {
    const {route, shouldPreview} = fileProperties;
    const filename = route.split('/').pop();

    // # Post file in center channel
    cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(route);
    cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
        return el.find('.post-image__thumbnail').length > 0;
    }));
    cy.get('#create_post').find('.file-preview').within(() => {
        // * Thumbnail exist
        cy.get('.post-image__thumbnail > div.video').should('exist');
    });
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
            expect(downloadLink.attr('download')).to.equal(filename);

            const fileAttachmentURL = downloadLink.attr('href');

            // * Verify that download link has correct name
            downloadAttachmentAndVerifyItsProperties(fileAttachmentURL, filename, 'attachment');
        });

        // # Close modal
        cy.get('.modal-close').click();
    });
}
