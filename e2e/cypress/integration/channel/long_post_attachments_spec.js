// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

let team;

function verifyImageInPostFooter(verifyExistence = true) {
    if (verifyExistence) {
        // * Verify that the image exists in the post message footer
        cy.get('#postCreateFooter').should('be.visible').find('div.post-image__column').
            should('exist').
            and('be.visible');
    } else {
        // * Verify that the image no longer exists in the post message footer
        cy.get('#postCreateFooter').find('div.post-image__column').should('not.exist');
    }
}

describe('M14322 Long post with multiple attachments', () => {
    before(() => {
        // # Login as new user
        cy.loginAsNewUser().then(() => {
            // # Create new team and visit its URL
            cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
                team = response.body;
                cy.visit(`/${team.name}`);
            });
        });
    });

    it('Attachment previews/thumbnails display as expected, when viewing full or partial post', () => {
        // Add 4 attachments to a post
        [...Array(4)].forEach(() => {
            cy.fileUpload('#fileUploadInput', 'small-image.png');
        });

        // # verify the attachment at the footer
        verifyImageInPostFooter();

        // # Copy and paste the text below into the message box and post
        cy.fixture('long_text_post.txt', 'utf-8').then((text) => {
            cy.get('#post_textbox').then((textbox) => {
                textbox.val(text);
            }).type(' {backspace}{enter}');
        });

        // * Verify show more button
        cy.get('#showMoreButton').scrollIntoView().should('be.visible').and('have.text', 'Show More');

        // * Verify gradient
        cy.get('#collapseGradient').should('be.visible');

        // * Verify the total 4 attached items are present
        cy.getLastPostId().then((postID) => {
            cy.get(`#${postID}_message`).findByTestId('fileAttachmentList').children().should('have.length', '4');

            // * Verify the preview attachment are present
            [...Array(4)].forEach((value, index) => {
                cy.get(`#${postID}_message`).findByTestId('fileAttachmentList').children().eq(index).
                    find('.post-image__name').contains('small-image.png').should('exist');
            });
        });
    });

    it('Can click one of the attachments and cycle through the multiple attachment previews as usual', () => {
        cy.getLastPostId().then((postID) => {
            cy.get(`#${postID}_message`).findByTestId('fileAttachmentList').children().first().click();

            // * Verify image preview must be visible
            cy.findByTestId('imagePreview').should('be.visible');

            // * Verify the footer with the count of the fileexists
            cy.findByTestId('fileCountFooter').should('be.visible').contains('File 1 of 4').should('exist');

            for (var index = 2; index <= 4; index++) {
                // # click on right arrow to preview next attached image
                cy.get('#previewArrowRight').should('be.visible').click();

                // * Verify the footer counter
                cy.findByTestId('fileCountFooter').contains(`File ${index} of 4`).should('exist');
            }

            // # click on close the preview
            cy.get('.modal-close').should('be.visible').click();
        });
    });
});