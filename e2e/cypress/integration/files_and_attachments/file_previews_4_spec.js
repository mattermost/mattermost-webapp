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

describe('Upload Files - Audio', () => {
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

    it('MM-T2264_19 - MP3', () => {
        const properties = {
            route: 'mm_file_testing/Audio/MP3.mp3',
            shouldPreview: true,
        };
        testAudioFile(properties);
    });

    it('MM-T2264_21 - AAC', () => {
        const properties = {
            route: 'mm_file_testing/Audio/AAC.aac',
            shouldPreview: false,
        };
        testAudioFile(properties);
    });

    it('MM-T2264_23 - OGG', () => {
        const properties = {
            route: 'mm_file_testing/Audio/OGG.ogg',
            shouldPreview: true,
        };
        testAudioFile(properties);
    });

    it('MM-T2264_24 - WAV', () => {
        const properties = {
            route: 'mm_file_testing/Audio/WAV.wav',
            shouldPreview: true,
        };
        testAudioFile(properties);
    });

    it('MM-T2264_25 - WMA', () => {
        const properties = {
            route: 'mm_file_testing/Audio/WMA.wma',
            shouldPreview: false,
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
