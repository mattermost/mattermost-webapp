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

describe('Upload Files - Settings', () => {
    let channelUrl;

    before(() => {
        // # Go to system admin then verify admin console URL and header
        cy.visit('/admin_console/site_config/file_sharing_downloads');
        cy.url().should('include', '/admin_console/site_config/file_sharing_downloads');
        cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).
            should('be.visible').
            and('have.text', 'File Sharing and Downloads');

        // # Set file sharing to false
        cy.findByTestId('FileSettings.EnableFileAttachmentsfalse').click();
        cy.get('#saveSetting').click();

        // # Create new team and new user and visit test channel
        cy.apiInitSetup({loginAfter: true}).then(({channelUrl: url}) => {
            channelUrl = url;
        });
    });

    beforeEach(() => {
        cy.visit(channelUrl);
    });

    it('MM-T1149_1 Disallow file sharing in the channel', () => {
        // * Attachment input should not exist in the DOM
        cy.get('#centerChannelFooter').find('#fileUploadInput').should('not.exist');

        // * Paper clip icon should not be visible in the center channel
        cy.get('#centerChannelFooter').find('#fileUploadButton').should('not.exist');

        // * Channel header file icon should not be visible
        cy.get('#channel-header').find('#channelHeaderFilesButton').should('not.exist');

        // # Post a message
        cy.postMessage('sample');

        // # Open RHS
        cy.getLastPost().click();

        // * Attachment input should not exist in the DOM
        cy.get('.post-create-body.comment-create-body').find('#fileUploadInput').should('not.exist');

        // * Paper clip icon should not be visible in the RHS
        cy.get('.post-create-body.comment-create-body').find('#fileUploadButton').should('not.exist');

        // # Click on the search input
        cy.uiGetSearchBox().click();

        // * Verify search hint does not have File button
        cy.get('#searchbar-help-popup').find('.search-hint__search-type-selector button > .icon-file-text-outline').should('not.exist');

        // # Search for posts
        cy.get('#searchBox').type('sample').type('{enter}');

        // * Verify search results do not have File button
        cy.get('.files-tab').should('not.exist');

        // # Delete the post
        cy.getLastPostId().then(cy.apiDeletePost);
    });

    it('MM-T1149_2 drag and drop a file on center and RHS should produce an error', () => {
        const filename = 'mattermost-icon.png';

        // # Drag and drop file
        cy.get('#channel_view').trigger('dragenter');
        cy.fixture(filename).then((img) => {
            const blob = Cypress.Blob.base64StringToBlob(img, 'image/png');
            cy.window().then((win) => {
                const file = new win.File([blob], filename);
                const dataTransfer = new win.DataTransfer();
                dataTransfer.items.add(file);
                cy.get('#channel_view').trigger('drop', {dataTransfer});

                // * An error should be visible saying 'File attachments are disabled'
                cy.get('#postCreateFooter').find('.has-error').should('contain.text', 'File attachments are disabled.');
            });
        });
    });

    it('MM-T1149_3 copy a file and paste in message box and reply box should produce an error', () => {
        const filename = 'mattermost-icon.png';

        // # Paste a file in the center channel
        cy.fixture(filename).then((img) => {
            const blob = Cypress.Blob.base64StringToBlob(img, 'image/png');
            cy.get('#create_post').trigger('paste', {clipboardData: {
                items: [{
                    name: filename,
                    kind: 'file',
                    type: 'image/png',
                    getAsFile: () => {
                        return blob;
                    },
                }],
                types: [],
            }});

            // * An error should be visible saying 'File attachments are disabled'
            cy.get('#postCreateFooter').find('.has-error').should('contain.text', 'File attachments are disabled.');
        });

        // # Post a message
        cy.postMessage('sample');

        // # Open RHS
        cy.getLastPost().click();

        // # Paste a file in the RHS
        cy.fixture(filename).then((img) => {
            const blob = Cypress.Blob.base64StringToBlob(img, 'image/png');
            cy.get('#reply_textbox').trigger('paste', {clipboardData: {
                items: [{
                    name: filename,
                    kind: 'file',
                    type: 'image/png',
                    getAsFile: () => {
                        return blob;
                    },
                }],
                types: [],
            }});

            // * An error should be visible saying 'File attachments are disabled'
            cy.get('.ThreadViewer').find('.post-create-footer').find('.has-error').should('contain.text', 'File attachments are disabled.');
        });

        // # Delete the post
        cy.getLastPostId().then(cy.apiDeletePost);
    });

    it('MM-T1149_4 keyboard shortcut CMD/CTRL+U should produce an error', () => {
        // # Type CMD/CRTL+U shortcut
        cy.get('#post_textbox').cmdOrCtrlShortcut('{U}');

        // * An error should be visible saying 'File attachments are disabled'
        cy.get('#postCreateFooter').find('.has-error').should('contain.text', 'File attachments are disabled.');
    });
});
