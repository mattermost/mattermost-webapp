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
        // 1. Change message display setting to compact
        cy.changeMessageDisplaySetting('COMPACT');
    });

    after(() => {
        // Revert setting so it does not impact other tests
        cy.changeMessageDisplaySetting('STANDARD');
    });

    it('M14283 Compact view: Line breaks remain intact after editing', () => {
        // 2. Enter in text
        cy.get('#post_textbox').
            type('First line').
            type('{shift}{enter}{enter}').
            type('Text after{enter}');

        // 3. Get last postId
        cy.getLastPostId().then((postId) => {
            const postMessageTextId = `#postMessageText_${postId}`;

            // * Verify HTML still includes new line
            cy.get(postMessageTextId).should('have.html', '<p>First line</p>\n<p>Text after</p>');

            // 4. click dot menu button
            cy.clickPostDotMenu();

            // 5. click edit post
            cy.get(`#edit_post_${postId}`).click();

            // 6. Add ",edited" to the text
            cy.get('#edit_textbox').type(',edited');

            // 7. Save
            cy.get('#editButton').click();

            // * Verify HTML includes newline and the edit
            cy.get(postMessageTextId).should('have.html', '<p>First line</p>\n<p>Text after,edited</p>');

            // * Post should have (edited)
            cy.get(`#postEdited_${postId}`).
                should('be.visible').
                should('contain', '(edited)');
        });
    });
});
