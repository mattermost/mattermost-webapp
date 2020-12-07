// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @file_and_attachments

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Upload Files', () => {
    let testTeam;
    let testChannel;

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;

            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.get('.announcement-bar__close').click();
        });
    });

    it('JPG', () => {
        const properties = {
            route: 'mm_file_testing/Images/JPG.jpg',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('PNG', () => {
        const properties = {
            route: 'mm_file_testing/Images/PNG.png',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('BMP', () => {
        const properties = {
            route: 'mm_file_testing/Images/BMP.bmp',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('GIF', () => {
        const properties = {
            route: 'mm_file_testing/Images/GIF.gif',
            originalWidth: 500,
            originalHeight: 500,
        };

        testImage(properties);
    });

    it('TIFF', () => {
        const properties = {
            route: 'mm_file_testing/Images/TIFF.tif',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('PSD', () => {
        const properties = {
            route: 'mm_file_testing/Images/PSD.psd',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('PDF', () => {
        const route =  'mm_file_testing/Documents/PDF.pdf';
        const filename = route.split("/").pop();
    
        // # Post file in center channel
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(route);
        cy.wait(TIMEOUTS.ONE_SEC);
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

    it('Excel', () => {
        const properties = {
            route: 'mm_file_testing/Documents/Excel.xlsx',
            type: 'excel',
        }
        testGenericFile(properties);
    });

    it('PPT', () => {
        const properties = {
            route: 'mm_file_testing/Documents/PPT.pptx',
            type: 'ppt',
        }
        testGenericFile(properties);
    });

    it('Word', () => {
        const properties = {
            route: 'mm_file_testing/Documents/Word.docx',
            type: 'word',
        }
        testGenericFile(properties);
    });

    it('Text', () => {
        const route =  'mm_file_testing/Documents/Text.txt';
        const filename = route.split("/").pop();

        // # Post file in center channel
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(route);
        cy.wait(TIMEOUTS.ONE_SEC);
        cy.get('#create_post').find('.file-preview').within(() => {
            // * Thumbnail exist
            cy.get(`.post-image__thumbnail > div.text`).should('exist');
        });
        cy.postMessage('{enter}');
        cy.wait(TIMEOUTS.ONE_SEC);

        cy.getLastPost().within(() => {
            cy.get('.post-image__thumbnail').within(() => {
                // * Image is posted
                cy.get(`.file-icon.text`).should('exist').click();
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

    it('MP4', () => {
        const properties = {
            route: 'mm_file_testing/Video/MP4.mp4',
            shouldPreview: true,
        }
        testVideoFile(properties);
    });

    it('AVI', () => {
        const properties = {
            route: 'mm_file_testing/Video/AVI.avi',
            shouldPreview: false,
        }
        testVideoFile(properties);
    });

    it('MKV', () => {
        const properties = {
            route: 'mm_file_testing/Video/MKV.mkv',
            shouldPreview: false,
        }
        testVideoFile(properties);
    });

    it('MOV', () => {
        const properties = {
            route: 'mm_file_testing/Video/MOV.mov',
            shouldPreview: true,
        }
        testVideoFile(properties);
    });

    it('MPG', () => {
        const properties = {
            route: 'mm_file_testing/Video/MPG.mpg',
            shouldPreview: false,
        }
        testVideoFile(properties);
    });

    it('WEBM', () => {
        const properties = {
            route: 'mm_file_testing/Video/WEBM.webm',
            shouldPreview: true,
        }
        testVideoFile(properties);
    });

    it('WMV', () => {
        const properties = {
            route: 'mm_file_testing/Video/WMV.wmv',
            shouldPreview: false,
        }
        testVideoFile(properties);
    });

    it('MP3', () => {
        const properties = {
            route: 'mm_file_testing/Audio/MP3.mp3',
            shouldPreview: true,
        }
        testAudioFile(properties);
    });

    it('M4A', () => {
        const properties = {
            route: 'mm_file_testing/Audio/M4A.m4a',
            shouldPreview: true,
        }
        testAudioFile(properties);
    });

    it('AAC', () => {
        const properties = {
            route: 'mm_file_testing/Audio/AAC.aac',
            shouldPreview: false,
        }
        testAudioFile(properties);
    });

    it('FLAC', () => {
        const properties = {
            route: 'mm_file_testing/Audio/FLAC.flac',
            shouldPreview: true,
        }
        testAudioFile(properties);
    });

    it('OGG', () => {
        const properties = {
            route: 'mm_file_testing/Audio/OGG.ogg',
            shouldPreview: true,
        }
        testAudioFile(properties);
    });

    it('WAV', () => {
        const properties = {
            route: 'mm_file_testing/Audio/WAV.wav',
            shouldPreview: true,
        }
        testAudioFile(properties);
    });

    it('WMA', () => {
        const properties = {
            route: 'mm_file_testing/Audio/WMA.wma',
            shouldPreview: false,
        }
        testAudioFile(properties);
    });
});

function testAudioFile(fileProperties) {
    const {route, shouldPreview} = fileProperties;
    const filename = route.split("/").pop();

    // # Post file in center channel
    cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(route);
    cy.wait(TIMEOUTS.ONE_SEC);
    cy.get('#create_post').find('.file-preview').within(() => {
        // * Thumbnail exist
        cy.get(`.post-image__thumbnail > div.audio`).should('exist');
    });
    cy.postMessage('{enter}');
    cy.wait(TIMEOUTS.ONE_SEC);

    cy.getLastPost().within(() => {
        cy.get('.post-image__thumbnail').within(() => {
            // * File is posted
            cy.get(`.file-icon.audio`).should('exist').click();
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
    const filename = route.split("/").pop();

    // # Post file in center channel
    cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(route);
    cy.wait(TIMEOUTS.ONE_SEC);
    cy.get('#create_post').find('.file-preview').within(() => {
        // * Thumbnail exist
        cy.get(`.post-image__thumbnail > div.video`).should('exist');
    });
    cy.postMessage('{enter}');
    cy.wait(TIMEOUTS.ONE_SEC);

    cy.getLastPost().within(() => {
        cy.get('.post-image__thumbnail').within(() => {
            // * File is posted
            cy.get(`.file-icon.video`).should('exist').click();
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
    const filename = route.split("/").pop();

    // # Post file in center channel
    cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(route);
    cy.wait(TIMEOUTS.ONE_SEC);
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
    const filename = route.split("/").pop();
    const aspectRatio = originalWidth / originalHeight;

    // # Post an image in center channel
    cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(route);
    cy.wait(TIMEOUTS.ONE_SEC);
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

function downloadAttachmentAndVerifyItsProperties(fileURL, filename, httpContext) {
    // * Verify it has not empty download link
    cy.request(fileURL).then((response) => {
        // * Verify that link can be downloaded
        expect(response.status).to.equal(200);

        // * Verify if link is an appropriate httpContext for opening in new tab or same and that can be saved locally
        // and it contains the correct filename* which will be used to name the downloaded file
        expect(response.headers['content-disposition']).to.
            equal(`${httpContext};filename="${filename}"; filename*=UTF-8''${filename}`);
    });
}
