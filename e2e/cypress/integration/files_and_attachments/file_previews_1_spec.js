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

describe('Upload Files - Image', () => {
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

    it('MM-T2264_1 - JPG', () => {
        const properties = {
            route: 'mm_file_testing/Images/JPG.jpg',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('MM-T2264_2 - PNG', () => {
        const properties = {
            route: 'mm_file_testing/Images/PNG.png',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('MM-T2264_4 - GIF', () => {
        const properties = {
            route: 'mm_file_testing/Images/GIF.gif',
            originalWidth: 500,
            originalHeight: 500,
        };

        testImage(properties);
    });

    it('MM-T2264_5 - TIFF', () => {
        const properties = {
            route: 'mm_file_testing/Images/TIFF.tif',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });
});

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
