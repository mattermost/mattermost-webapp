// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @file_and_attachments

import * as MESSAGES from '../../fixtures/messages';
import * as TIMEOUTS from '../../fixtures/timeouts';

import {downloadAttachmentAndVerifyItsProperties} from './helpers';

describe('Upload Files', () => {
    let testTeam;
    let testChannel;
    let otherUser;

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;

            cy.apiCreateUser().then(({user: user2}) => {
                otherUser = user2;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });

            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
        });
    });

    it('MM-T336 Image thumbnail - expanded RHS', () => {
        const filename = 'huge-image.jpg';
        const originalWidth = 1920;
        const originalHeight = 1280;
        const aspectRatio = originalWidth / originalHeight;

        // # Post an image in center channel
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(filename);
        cy.get('.post-image').should('be.visible');
        cy.postMessage('{enter}');

        // # Click reply arrow to open the reply thread in RHS
        cy.clickPostCommentIcon();

        cy.get('#rhsContainer').within(() => {
            // # Observe image thumbnail displays the same
            cy.get('img[src*="/preview"]').should('be.visible').and((img) => {
                expect(img.width() / img.height()).to.be.closeTo(aspectRatio, 0.01);
            });

            // # In the RHS, click the expand arrows to expand the RHS
            cy.findByLabelText('Expand').click();
        });

        cy.get('.sidebar--right--expanded').should('be.visible').within(() => {
            // * Observe image thumnail displays the same
            cy.get('img[src*="/preview"]').should('be.visible').and((img) => {
                expect(img.width() / img.height()).to.be.closeTo(aspectRatio, 0.01);
            });
        });

        // # Close the RHS panel
        cy.closeRHS();
    });

    it('MM-T340 Download - File name link on thumbnail', () => {
        const attachmentFilesList = [
            {
                filename: 'word-file.doc',
                extensions: 'DOC',
                type: 'document',
            },
            {
                filename: 'wordx-file.docx',
                extensions: 'DOCX',
                type: 'document',
            },
            {
                filename: 'powerpoint-file.ppt',
                extensions: 'PPT',
                type: 'document',
            },
            {
                filename: 'powerpointx-file.pptx',
                extensions: 'PPTX',
                type: 'document',
            },
            {
                filename: 'jpg-image-file.jpg',
                extensions: 'JPG',
                type: 'image',
            },
        ];

        attachmentFilesList.forEach((file) => {
            // # Attach the file as attachment and post a message
            cy.get('#fileUploadInput').attachFile(file.filename);
            cy.postMessage(MESSAGES.SMALL);

            // # Get the post id of the last message
            cy.getLastPostId().then((lastPostId) => {
                // # Scan inside of the last post message
                cy.get(`#${lastPostId}_message`).should('exist').and('be.visible').within(() => {
                    // # If file type is document then file container will be rendered
                    if (file.type === 'document') {
                        // * Check if the download icon is exists
                        cy.findByLabelText('download').should('exist').then((fileAttachment) => {
                            // * Verify if download attribute exists which allows to download instead of navigation
                            expect(fileAttachment.attr('download')).to.equal(file.filename);

                            const fileAttachmentURL = fileAttachment.attr('href');

                            // * Verify that download link has correct name
                            downloadAttachmentAndVerifyItsProperties(fileAttachmentURL, file.filename, 'attachment');
                        });

                        // * Check if the file name is shown in the attachment
                        cy.findByText(file.filename).should('be.visible');

                        // * Check if correct extension is shown in the attachment and click to open preview
                        cy.findByText(file.extensions).should('be.visible').click();
                    } else if (file.type === 'image') {
                        // * Check that image is in the post message with valid source link
                        cy.findByLabelText(`file thumbnail ${file.filename}`).should('be.visible').
                            and('have.attr', 'src');

                        // # Click on the image to open the preview
                        cy.findByLabelText(`file thumbnail ${file.filename}`).click();
                    }
                });
            });

            // * Verify preview modal is opened
            cy.get('.a11y__modal').should('exist').and('be.visible').
                within(() => {
                    // * Check for download property of the download button
                    cy.findByText('Download').should('be.visible').parent().then((fileAttachment) => {
                        // * Verify if download attribute exists which allows to download instead of navigation
                        expect(fileAttachment.attr('download')).to.equal(file.filename);

                        const fileAttachmentURL = fileAttachment.attr('href');

                        // * Verify that download link has correct name
                        downloadAttachmentAndVerifyItsProperties(fileAttachmentURL, file.filename, 'attachment');
                    });
                });

            // # Close the image preview modal
            cy.get('body').type('{esc}');
        });
    });

    it('MM-T341 Download link on preview - Image file (non SVG)', () => {
        ['bmp-image-file.bmp', 'png-image-file.png', 'jpg-image-file.jpg', 'gif-image-file.gif', 'tiff-image-file.tif'].
            forEach((image) => {
                cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(image);
                cy.get('.post-image').should('be.visible');
                cy.postMessage(MESSAGES.SMALL);
                cy.uiWaitUntilMessagePostedIncludes(MESSAGES.SMALL);
                cy.getLastPostId().then((postId) => {
                    cy.get(`#post_${postId}`).within(() => {
                    // # Click the thumbnail of a non-SVG image attachment to open the previewer
                        cy.get('div.image-loaded').find('img').click();
                    });
                });
                cy.get('.a11y__modal').should('be.visible').within(() => {
                // # Click the "Download" link in the previewer
                    cy.findByText('Download').should('be.visible').parent().then((fileAttachment) => {
                    // * Verify if download attribute exists which allows to download instead of navigation
                        expect(fileAttachment.attr('download')).to.equal(image);

                        const fileAttachmentURL = fileAttachment.attr('href');

                        // * Verify that download link has correct name
                        downloadAttachmentAndVerifyItsProperties(fileAttachmentURL, image, 'attachment');
                    });
                });
                cy.get('body').type('{esc}');
            });
    });

    it('MM-T12 Loading indicator when posting images', () => {
        const filename = 'huge-image.jpg';

        // # Post an image in center channel
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(filename);
        cy.get('.post-image').should('be.visible');
        cy.postMessage('{enter}');

        // # Login as otherUser
        cy.apiLogin(otherUser);

        // # Reload the page
        cy.reload();

        // * Verify the image loading component is visible
        cy.get('.image-container').should('be.visible').find('.image-loading__container').should('be.visible');

        Cypress._.times(5, () => {
            // # OtherUser creates posts in the channel
            cy.postMessageAs({
                sender: otherUser,
                message: 'message',
                channelId: testChannel.id,
            });

            // * Verify image is not loading for each posts
            cy.get('.image-container').should('be.visible').find('.image-loading__container').should('not.exist');

            cy.wait(TIMEOUTS.HALF_SEC);
        });
    });

    it('MM-T337 CTRL/CMD+U - Five files on one message, thumbnails while uploading', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);
        const filename = 'huge-image.jpg';
        cy.get('#centerChannelFooter').find('#fileUploadInput').
            attachFile(filename).
            attachFile(filename).
            attachFile(filename).
            attachFile(filename).
            attachFile(filename);
        for (let i = 1; i < 4; i++) {
            cy.get(`:nth-child(${i}) > .post-image__thumbnail > .post-image`).should('be.visible');
        }
        cy.get(':nth-child(5) > .post-image__thumbnail > .post-image').should('not.be.visible');
        cy.get('.file-preview__container').scrollTo('right');
        for (let i = 1; i < 3; i++) {
            cy.get(`:nth-child(${i}) > .post-image__thumbnail > .post-image`).should('not.be.visible');
        }
        cy.get(':nth-child(5) > .post-image__thumbnail > .post-image').should('be.visible');
        cy.postMessage('test');
        cy.findByTestId('fileAttachmentList').find('.post-image').should('have.length', 5);
    });

    it('MM-T338 Image Attachment Upload in Mobile View', () => {
        // # Set the viewport to mobile
        cy.viewport('iphone-6');

        // # Scan inside of the message input region
        cy.findByLabelText('message input complimentary region').should('be.visible').within(() => {
            // * Check if the attachment button is present
            cy.findByLabelText('Attachment Icon').should('be.visible').and('have.css', 'cursor', 'pointer');
        });

        const imageFilename = 'jpg-image-file.jpg';
        const imageType = 'JPG';

        // # Attach an image but don't post it yet
        cy.get('#fileUploadInput').attachFile(imageFilename);

        // # Scan inside of the message footer region
        cy.get('#postCreateFooter').should('be.visible').within(() => {
            // * Verify that image name is present
            cy.findByText(imageFilename).should('be.visible');

            // * Verify that image type is present
            cy.findByText(imageType).should('be.visible');

            // # Get the image preview div
            cy.get('.post-image.normal').then((imageDiv) => {
                // # Filter out the url from the css background property
                // url("https://imageurl") => https://imageurl
                const imageURL = imageDiv.css('background-image').split('"')[1];

                downloadAttachmentAndVerifyItsProperties(imageURL, imageFilename, 'inline');
            });
        });

        // # Now post with the message attachment
        cy.postMessage('{enter}');

        // # Get the post id of the last message
        cy.getLastPostId().then((lastPostId) => {
            // # Scan inside of the last post message
            cy.get(`#${lastPostId}_message`).and('be.visible').within(() => {
                // * Check that image is in the post message with valid source link
                cy.findByLabelText(`file thumbnail ${imageFilename}`).should('be.visible').
                    and('have.attr', 'src').then((src) => {
                        downloadAttachmentAndVerifyItsProperties(src, imageFilename, 'inline');
                    });
            });
        });
    });
});
