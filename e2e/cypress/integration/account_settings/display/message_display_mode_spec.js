// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Account Settings > Display > Message Display', () => {
    before(() => {
        // # Change message display setting to compact
        cy.apiLogin('user-1');
        cy.changeMessageDisplaySetting('COMPACT');
    });

    after(() => {
        // Revert setting so it does not impact other tests
        cy.apiSaveMessageDisplayPreference('clean');
    });

    it('M14283 Compact view: Line breaks remain intact after editing', () => {
        // # Enter in text
        cy.get('#post_textbox').
            clear().
            type('First line').
            type('{shift}{enter}{enter}').
            type('Text after{enter}');

        // # Get last postId
        cy.getLastPostId().then((postId) => {
            const postMessageTextId = `#postMessageText_${postId}`;

            // * Verify HTML still includes new line
            cy.get(postMessageTextId).should('have.html', '<p>First line</p>\n<p>Text after</p>');

            // # click dot menu button
            cy.clickPostDotMenu(postId);

            // # click edit post
            cy.get(`#edit_post_${postId}`).should('be.visible').click();

            // # Add ",edited" to the text
            cy.get('#edit_textbox').type(',edited');

            // # Save
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
