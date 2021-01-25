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

describe('Upload Files', () => {
    let testTeam;

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;

            cy.visitAndWait(`/${testTeam.name}/channels/${channel.name}`);
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

    it('MM-T2264_7 - PDF', () => {
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
            cy.get('.pdf').get('.post-code').get('canvas').should('have.length', 5);

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

    it('MM-T2264_8 - Excel', () => {
        const properties = {
            route: 'mm_file_testing/Documents/Excel.xlsx',
            type: 'excel',
        };
        testGenericFile(properties);
    });

    it('MM-T2264_9 - PPT', () => {
        const properties = {
            route: 'mm_file_testing/Documents/PPT.pptx',
            type: 'ppt',
        };
        testGenericFile(properties);
    });

    it('MM-T2264_10 - Word', () => {
        const properties = {
            route: 'mm_file_testing/Documents/Word.docx',
            type: 'word',
        };
        testGenericFile(properties);
    });

    it('MM-T2264_11 - Text', () => {
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

function testGenericFile(fileProperties) {
    const {route, type} = fileProperties;
    const filename = route.split('/').pop();

    // # Post file in center channel
    cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(route);
    cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
        return el.find('.post-image__thumbnail').length > 0;
    }));
    cy.get('#create_post').find('.file-preview').within(() => {
        // * Thumbnail exist
        cy.get(`.post-image__thumbnail > div.${type}`).should('exist');
    });
    cy.postMessage('{enter}');
    cy.wait(TIMEOUTS.ONE_SEC);

    cy.getLastPost().within(() => {
        cy.get('.post-image__thumbnail').within(() => {
            // * File is posted
            cy.get(`.file-icon.${type}`).should('exist').click();
        });
    });

    cy.get('.modal-body').within(() => {
        // * No apparent way to check the thumbnail is the correct one.
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
