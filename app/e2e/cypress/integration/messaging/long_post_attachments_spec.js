// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

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

function postAttachments() {
    // Add 4 attachments to a post
    [...Array(4)].forEach(() => {
        cy.get('#fileUploadInput').attachFile('small-image.png');
    });

    // # verify the attachment at the footer
    verifyImageInPostFooter();

    // # Copy and paste the text below into the message box and post
    cy.fixture('long_text_post.txt', 'utf-8').then((text) => {
        cy.get('#post_textbox').then((textbox) => {
            textbox.val(text);
        }).type(' {backspace}{enter}');
    });
}

describe('MM-T105 Long post with mutiple attachments', () => {
    let testTeam;

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('Attachment previews/thumbnails display as expected, when viewing full or partial post', () => {
        // # Post attachments
        postAttachments();

        // * Verify show more button
        cy.get('#showMoreButton').scrollIntoView().should('be.visible').and('have.text', 'Show more');

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
        // # Post attachments
        postAttachments();

        // * Verify the attached items can be cycled through
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

            // * Verify that the preview modal opens
            cy.get('div.modal-image__content').should('be.visible').trigger('mouseover');

            // # Close the modal
            cy.get('div.modal-close').should('exist').click({force: true});
        });
    });
});
