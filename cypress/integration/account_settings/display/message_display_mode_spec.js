// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 3]*/

describe('Account Settings > Display > Message Display', () => {
    before(() => {
        // 1. Go to Account Settings with "user-2"
        cy.toAccountSettingsModal('user-2');
    });

    it('M14283 Compact view: Line breaks remain intact after editing', () => {
        // 2. Click the Display tab
        cy.get('#displayButton').click();

        // * Check that it changed into the Display section
        cy.get('#displaySettingsTitle').
            should('be.visible').
            should('contain', 'Display Settings');

        // 3. Scroll up to bring Message Display setting in viewable area.
        cy.get('#message_displayTitle').scrollIntoView();

        // 4. Click "Edit" to the right of "Message Display"
        cy.get('#message_displayTitle').click();

        // 5. Scroll a bit to show the "Save" button
        cy.get('.section-max').scrollIntoView();

        // 6. Click the compact radio
        cy.get('#message_displayFormatB').click();

        // 7. Click "Save"
        cy.get('#saveSetting').click();

        // 8. Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();

        // 9. Go to channel which has any posts
        cy.visit('/ad-1/channels/ratione-1');

        // 10. Enter in text
        cy.get('#post_textbox').type('First line');
        cy.get('#post_textbox').type('{shift}{enter}{enter}');
        cy.get('#post_textbox').type('Text after');

        // 11. Submit post
        cy.get('#create_post').submit();

        // 12. Get last postId
        cy.getLastPostId().then((postId) => {
            const postMessageTextId = `#postMessageText_${postId}`;

            // * Verify HTML still includes new line
            cy.get(postMessageTextId).should('have.html', '<p>First line</p>\n<p>Text after</p>\n');

            // 13. click dot menu button
            cy.clickPostDotMenu();

            // 14. click edit post
            cy.get(`#edit_post_${postId}`).click();

            // 15. Add ",edited" to the text
            cy.get('#edit_textbox').type(',edited');

            // 16. Save
            cy.get('#editButton').click();

            // * Verify HTML includes newline and the edit
            cy.get(postMessageTextId).should('have.html', '<p>First line</p>\n<p>Text after,edited</p>\n');

            // *  Post should have (edited)
            cy.get(`#post_${postId}`).find('.post-edited__indicator');
        });
    });
});
