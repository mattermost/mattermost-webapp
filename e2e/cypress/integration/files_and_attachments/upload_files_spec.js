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

describe('Upload Files', () => {
    let testTeam;
    let testChannel;
    let otherUser;

    beforeEach(() => {
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
                filename: 'image-file.jpg',
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

    it('MM-T338 Image Attachment Upload in Mobile View', () => {
        // # Set the viewport to mobile
        cy.viewport('iphone-6');

        // # Scan inside of the message input region
        cy.findByLabelText('message input complimentary region').should('be.visible').within(() => {
            // * Check if the attachment button is present
            cy.findByLabelText('Attachment Icon').should('be.visible').and('have.css', 'cursor', 'pointer');
        });

        const imageName = 'image-file';
        const imageType = 'jpg';
        const imageFilename = `${imageName}.${imageType}`;

        // # Attach an image but dont post it yet
        cy.get('#fileUploadInput').attachFile(imageFilename);

        // # Scan inside of the message footer region
        cy.get('#postCreateFooter').should('be.visible').within(() => {
            // * Verify that image name is present
            cy.findByText(imageFilename).should('be.visible');

            // * Verify that image type is present
            cy.findByText(imageType.toUpperCase()).should('be.visible');

            // # Get the image preview div
            cy.get('.post-image.normal').then((imageDiv) => {
                // # Filter out the url from the css background property
                // url("https://imageurl") => https://imageurl
                const imageURL = imageDiv.css('background-image').replace('url(', '').replace(')', '').replace(/"/gi, '');

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
