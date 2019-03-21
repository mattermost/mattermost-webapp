// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('M14322 Long post with multiple attachments', () => {
    const attachments = [{file: 'mattermost-icon.png', type: 'image/png'}, {file: 'mattermost-icon.png', type: 'image/png'},
        {file: 'mattermost-icon.png', type: 'image/png'}, {file: 'long_text_post.txt', type: 'text/txt'}];

    before(() => {
        //1. Login and visit the default channel
        cy.login('user-1');
        cy.visit('/');

        //2. Upload 4 file attachments
        attachments.forEach((attachment) => {
            cy.uploadFile('#fileUploadButton input', `../fixtures/${attachment.file}`, attachment.type);
        });

        //3. Post a long message
        cy.fixture('long_text_post.txt', 'utf-8').then((text) => {
            cy.get('#post_textbox').then((textbox) => {
                textbox.val(text);
            }).type(' {backspace}{enter}');
        });
        cy.wait(200);
    });

    it('Attachment previews/thumbnails display as expected, when viewing full or partial post', () => {
        // * Check attachments with partial text are posted
        cy.postFourAttachments('Show More');

        // * Check attachments with full text are posted
        cy.postFourAttachments('Show Less');
    });

    it('Can click one of the attachments and cycle through the multiple attachment previews as usual', () => {
        //4. Get the last post
        cy.getLastPostId().then((postID) => {
            //5. View the first attachment
            cy.get(`#${postID}_message`).find('#fileAttachmentList').children().first().click();

            //* Check the sequence of attachment previews
            cy.get('#popoverBar').contains(`File ${1} of ${attachments.length}`);

            //* Check the visibilty of the overlay image
            cy.get('#modal-image__content').should('be.visible');

            //6. View the next attachments
            for (var i = 2; i <= 4; i++) {
                cy.get('#previewArrowRight').click();
                cy.get('#popoverBar').contains(`File ${i} of ${attachments.length}`);
            }

            //* Check the preview cycle
            cy.get('#previewArrowRight').click();
            cy.get('#popoverBar').contains(`File ${1} of ${attachments.length}`);

            //7. Close the preview
            cy.get('#modal-close').should('be.visible').click();
        });
    });
});
