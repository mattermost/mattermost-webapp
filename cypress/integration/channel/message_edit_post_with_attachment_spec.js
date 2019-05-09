// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 4] */

describe('MM-13697 Edit Post with attachment', () => {
    before(() => {
        // 1. Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('Pasted text should be pasted where the cursor is', () => {
        // 2. Got to a test channel on the side bar
        cy.get('#sidebarItem_town-square').scrollIntoView();

        // * Validate if the channel has been opened
        cy.url().should('include', '/ad-1/channels/town-square');

        // 3. Attach image
        cy.fixture('mattermost-icon.png').then((fileContent) => {
            cy.get('#fileUploadButton input').upload(
                {fileContent, fileName: 'mattermost-icon.png', mimeType: 'image/png'},
                {subjectType: 'drag-n-drop'},
            );
        });

        // 4. Type 'This is sample text' and submit
        cy.get('#post_textbox').type('This is sample text{enter}');

        // 6. Get last post ID
        cy.getLastPostId().then((postID) => {
            // 7. click  dot menu button
            cy.clickPostDotMenu();

            // 8. click edit post
            cy.get(`#edit_post_${postID}`).click();

            // * Check if focus is set to "edit_textbox"
            cy.focused().should('have.attr', 'id', 'edit_textbox');

            // 9. Edit message to 'This is sample add text'
            cy.get('#edit_textbox').should('be.visible').type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}add ');

            // 10. Click button Edit
            cy.get('#editButton').click();

            cy.get(`#${postID}_message`).within(() => {
                // * Assert post message should contain 'This is sample add text'
                cy.get('.post-message__text p').should('contain', 'This is sample add text');

                // * Assert file attachment should still exist
                cy.get('.file-view--single').should('be.visible');
            });
        });
    });
});
