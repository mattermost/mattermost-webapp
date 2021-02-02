// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @files_and_attachments

import * as TIMEOUTS from '../../fixtures/timeouts';

import {downloadAttachmentAndVerifyItsProperties} from './helpers';

describe('Upload Files - Failing cases', () => {
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

    it('MM-T2264_3 - BMP', () => {
        const properties = {
            route: 'mm_file_testing/Images/BMP.bmp',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('MM-T2264_6 - PSD', () => {
        const properties = {
            route: 'mm_file_testing/Images/PSD.psd',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('MM-T2264_15 - MOV', () => {
        const properties = {
            route: 'mm_file_testing/Video/MOV.mov',
            shouldPreview: true,
        };
        testVideoFile(properties);
    });

    it('MM-T2264_20 - M4A', () => {
        const properties = {
            route: 'mm_file_testing/Audio/M4A.m4a',
            shouldPreview: true,
        };
        testAudioFile(properties);
    });

    it('MM-T2264_22 - FLAC', () => {
        const properties = {
            route: 'mm_file_testing/Audio/FLAC.flac',
            shouldPreview: true,
        };
        testAudioFile(properties);
    });
});

function testAudioFile(fileProperties) {
    const {route, shouldPreview} = fileProperties;
    const filename = route.split('/').pop();

    // # Post file in center channel
    cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(route);
    cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
        return el.find('.post-image__thumbnail').length > 0;
    }));
    cy.get('#create_post').find('.file-preview').within(() => {
        // * Thumbnail exist
        cy.get('.post-image__thumbnail > div.audio').should('exist');
    });
    cy.postMessage('{enter}');
    cy.wait(TIMEOUTS.ONE_SEC);

    cy.getLastPost().within(() => {
        cy.get('.post-image__thumbnail').within(() => {
            // * File is posted
            cy.get('.file-icon.audio').should('exist').click();
        });
    });

    cy.get('.modal-body').within(() => {
        if (shouldPreview) {
            // * Check if the video element exist
            // Audio is also played by the video element
            cy.get('video').should('exist');
        }

        // # Hover over the modal
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

function testImage(imageProperties) {
    const {route, originalWidth, originalHeight} = imageProperties;
    const filename = route.split('/').pop();
    const aspectRatio = originalWidth / originalHeight;

    // # Post an image in center channel
    cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(route);
    cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
        return el.find('.post-image__thumbnail').length > 0;
    }));
    cy.get('.post-image').should('be.visible');
    cy.get('#create_post').find('.file-preview').within(() => {
        // * Img thumbnail exist
        cy.get('.post-image__thumbnail > div.post-image.normal').should('exist');
    });
    cy.postMessage('{enter}');
    cy.wait(TIMEOUTS.ONE_SEC);

    cy.getLastPost().within(() => {
        cy.get('.file-view--single').within(() => {
            // * Image is posted
            cy.get('img').should('exist').and((img) => {
            // * Image aspect ratio is maintained
                expect(img.width() / img.height()).to.be.closeTo(aspectRatio, 0.01);
            }).click();
        });
    });

    cy.get('.modal-body').within(() => {
        cy.get('.modal-image__content').get('img').should('exist').and((img) => {
            // * Image aspect ratio is maintained
            expect(img.width() / img.height()).to.be.closeTo(aspectRatio, 0.01);
        });

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
