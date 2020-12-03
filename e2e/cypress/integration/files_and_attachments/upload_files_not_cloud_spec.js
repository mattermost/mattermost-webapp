// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @not_cloud @file_and_attachments

import * as TIMEOUTS from '../../fixtures/timeouts';

import {downloadAttachmentAndVerifyItsProperties} from './helpers';

describe('Upload Files', () => {
    let testTeam;
    let testChannel;
    let otherUser;

    before(() => {
        cy.shouldNotRunOnCloudEdition();
    });

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

    it('MM-T346 Public link related to a deleted post should no longer open the file', () => {
        // # Enable option for public file links
        cy.apiUpdateConfig({
            FileSettings: {
                EnablePublicLink: true,
            },
        }).then(({config}) => {
            expect(config.FileSettings.EnablePublicLink).to.be.true;

            // # Reload to ensure that the new config takes effect
            cy.reload();

            const attachmentFilename = 'jpg-image-file.jpg';

            // # Make a post with a file attached
            cy.get('#fileUploadInput').attachFile(attachmentFilename);
            cy.postMessage('Post with attachment to be deleted');

            // # Get the last post
            cy.getLastPostId().then((lastPostId) => {
                // # Scan inside of the last post message
                cy.get(`#${lastPostId}_message`).and('be.visible').within(() => {
                    // * Check if the attached image is in the post and then click to open the preview
                    cy.findByLabelText(`file thumbnail ${attachmentFilename}`).should('be.visible').click();
                });
            });

            // * Verify preview modal is opened
            cy.get('.a11y__modal').should('exist').and('be.visible').
                within(() => {
                // * Check if get public link button is present and click it
                    cy.findByText('Get a public link').should('be.visible').click({force: true});
                });

            // # Wait a little for link to get generate
            cy.wait(TIMEOUTS.ONE_SEC);

            // * Verify copy public link modal is opened
            cy.get('.a11y__modal.modal-dialog').should('exist').and('be.visible').
                within(() => {
                    // * Verify that copy link button is present
                    cy.findByText('Copy Link').should('be.visible');

                    // # Get the copy link of the attachment and save for later purpose
                    cy.get('#linkModalTextArea').invoke('text').as('publicLinkOfAttachment');
                });

            // # Close the image preview modal
            cy.get('body').type('{esc}');

            // # Once again get the last post with attachment, this time to delete it
            cy.getLastPostId().then((lastPostId) => {
                // # Click post dot menu in center.
                cy.clickPostDotMenu(lastPostId);

                // # Scan inside the post menu dropdown
                cy.get(`#CENTER_dropdown_${lastPostId}`).should('exist').within(() => {
                    // # Click on the delete post button from the dropdown
                    cy.findByText('Delete').should('exist').click();
                });
            });

            // * Verify caution dialog for delete post is visible
            cy.get('.a11y__modal.modal-dialog').should('exist').and('be.visible').
                within(() => {
                    // # Confirm click on the delete button for the post
                    cy.findByText('Delete').should('be.visible').click();
                });

            // # Try to fetch the url of the attachment we previously deleted
            cy.get('@publicLinkOfAttachment').then((publicLinkOfAttachment) => {
                cy.request({url: publicLinkOfAttachment, failOnStatusCode: false}).then((response) => {
                    // * Verify that the link no longer exists in the system
                    expect(response.status).to.be.equal(404);
                });

                // # Open the deleted link in the browser
                cy.visit(publicLinkOfAttachment, {failOnStatusCode: false});
            });

            // * Verify that we land on attachment not found page
            cy.findByText('Error').should('be.visible');
            cy.findByText('Unable to get the file info.').should('be.visible');
            cy.findByText('Back to Mattermost').should('be.visible').parent().
                should('have.attr', 'href', '/').click();
        });
    });

    it('MM-T345 Public links for common file types should open in a new browser tab', () => {
        // # Enable option for public file links
        cy.apiUpdateConfig({
            FileSettings: {
                EnablePublicLink: true,
            },
        });

        // # Save Show Preview Preference to true
        cy.apiSaveLinkPreviewsPreference('true');

        // # Save Preview Collapsed Preference to false
        cy.apiSaveCollapsePreviewsPreference('false');

        const commonTypeFiles = ['jpg-image-file.jpg', 'gif-image-file.gif', 'png-image-file.png',
            'tiff-image-file.tif', 'mp3-audio-file.mp3', 'mp4-video-file.mp4', 'mpeg-video-file.mpg'];

        commonTypeFiles.forEach((file) => {
            // # Make a post with a file attached
            cy.get('#fileUploadInput').attachFile(file);
            cy.postMessage(`Attached with ${file}`);

            // # Get the last post
            cy.getLastPostId().then((lastPostId) => {
            // # Scan inside of the last post message
                cy.get(`#${lastPostId}_message`).and('be.visible').within(() => {
                // * Check if the attached file is in the post and then click to open preview
                    cy.findByLabelText(`file thumbnail ${file}`).should('be.visible').click();
                });
            });

            // * Verify preview modal is opened
            cy.get('.a11y__modal').should('exist').and('be.visible').
                within(() => {
                    // * Check if get public link button is present and click it
                    cy.findByText('Get a public link').should('be.visible').click({force: true});
                });

            // # Wait a little for url to be (re)generated
            cy.wait(TIMEOUTS.ONE_SEC);

            // * Verify copy public link modal is opened
            cy.get('.a11y__modal.modal-dialog').should('exist').and('be.visible').
                within(() => {
                    // * Verify that copy link button is present and click it
                    cy.findByText('Copy Link').should('be.visible').parent().click({force: true});

                    // # Get the copy link of the attachment and save for later purpose
                    cy.get('#linkModalTextArea').invoke('text').as(`publicLinkOfAttachment-${file}`);

                    cy.get('.modal-footer').should('exist').within(() => {
                        // # Click close modal
                        cy.findByText('Close').should('be.visible').click();
                    });
                });

            cy.get(`@publicLinkOfAttachment-${file}`).then((publicLinkOfAttachment) => {
                // # Post the link of attachment as a message
                cy.uiPostMessageQuickly(publicLinkOfAttachment);

                // * Check the attachment url contains the attachment
                downloadAttachmentAndVerifyItsProperties(publicLinkOfAttachment, file, 'inline');
            });
        });
    });
});
