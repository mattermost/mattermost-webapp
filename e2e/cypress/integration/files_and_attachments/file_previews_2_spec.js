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

import {downloadAttachmentAndVerifyItsProperties, testGenericFile} from './helpers';

describe('Upload Files - Generic', () => {
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

    it('MM-T3824_1 - PDF', () => {
        const route = 'mm_file_testing/Documents/PDF.pdf';
        const filename = route.split('/').pop();

        // # Post file in center channel
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(route);
        cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
            return el.find('.post-image__thumbnail').length > 0;
        }));
        cy.get('#create_post').find('.file-preview').within(() => {
            // * Thumbnail exist
            cy.get('.post-image__thumbnail > div.pdf').should('exist');
        });
        cy.postMessage('{enter}');
        cy.wait(TIMEOUTS.ONE_SEC);

        cy.getLastPost().within(() => {
            cy.get('.post-image__thumbnail').within(() => {
                // * File is posted
                cy.get('.file-icon.pdf').should('exist').click();
            });
        });

        cy.get('.modal-body').within(() => {
            cy.get('.pdf').get('.post-code').get('canvas').should('have.length', 10);

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
    });

    it('MM-T3824_2 - Excel', () => {
        const properties = {
            route: 'mm_file_testing/Documents/Excel.xlsx',
            type: 'excel',
        };
        testGenericFile(properties);
    });

    it('MM-T3824_3 - PPT', () => {
        const properties = {
            route: 'mm_file_testing/Documents/PPT.pptx',
            type: 'ppt',
        };
        testGenericFile(properties);
    });

    it('MM-T3824_4 - Word', () => {
        const properties = {
            route: 'mm_file_testing/Documents/Word.docx',
            type: 'word',
        };
        testGenericFile(properties);
    });

    it('MM-T3824_5 - Text', () => {
        const route = 'mm_file_testing/Documents/Text.txt';
        const filename = route.split('/').pop();

        // # Post file in center channel
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(route);
        cy.wait(TIMEOUTS.ONE_SEC);
        cy.get('#create_post').find('.file-preview').within(() => {
            // * Thumbnail exist
            cy.get('.post-image__thumbnail > div.text').should('exist');
        });
        cy.postMessage('{enter}');
        cy.wait(TIMEOUTS.ONE_SEC);

        cy.getLastPost().within(() => {
            cy.get('.post-image__thumbnail').within(() => {
                // * Image is posted
                cy.get('.file-icon.text').should('exist').click();
            });
        });

        cy.get('.modal-body').within(() => {
            cy.get('.post-code').get('code').should('exist');

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
    });
});
