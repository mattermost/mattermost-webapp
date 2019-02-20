// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 3] */

describe('MM-13697 Edit Post with attachment', () => {
    before(() => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');
    });

    it('Pasted text should be pasted where the cursor is', () => {
        // 2. Got to a test channel on the side bar
        cy.get('#sidebarItem_town-square').should('be.visible').click({force: true});

        // * Validate if the channel has been opened
        cy.url().should('include', '/ad-1/channels/town-square');

        // 3. Attach image
        cy.uploadFile('#fileUploadButton input', '../fixtures/mattermost-icon.png', 'image/png');

        // 4. Type 'This is sample text'
        cy.get('#post_textbox').type('This is sample text').should('contain', 'This is sample text');

        // 5. Submit post
        cy.get('#create_post').submit();

        // 6. Get last post ID
        cy.getLastPostId().then((postID) => {
            // 7. click  dot menu button
            cy.clickPostDotMenu();

            // 8. click edit post
            cy.get(`#edit_post_${postID}`).click();

            // 9. Edit message to 'This is sample add text'
            cy.get('#edit_textbox').should('be.visible').type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}add ');

            // 10. Click button Edit
            cy.get('#editButton').click();

            // * Assert post message should contain 'This is sample add text'
            cy.get(`#${postID}_message`).find('.post-message__text p').should('contain', 'This is sample add text');

            // * Assert file attachment should still exist
            cy.get(`#${postID}_message`).find('.file-view--single').should('be.visible');
        });
    });
});
