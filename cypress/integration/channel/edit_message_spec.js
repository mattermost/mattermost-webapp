// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 5] */

describe('Edit Message', () => {
    it('M13909 Escape should not close modal when an autocomplete drop down is in use', () => {
        // 1. Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // 2. Post message "Hello"
        cy.get('#post_textbox').type('Hello World!').type('{enter}');

        // 3. Hit the up arrow to open the "edit modal"
        cy.get('#post_textbox').type('{uparrow}');

        // 4. In the modal type @
        cy.get('#edit_textbox').type(' @');

        // * Assert user autocomplete is visible
        cy.get('#suggestionList').should('be.visible');

        // 5. Press the escape key
        cy.get('#edit_textbox').focus().type('{esc}');

        // * Check if the textbox contains expected text
        cy.get('#edit_textbox').should('contain', 'Hello World! @');

        // * Assert user autocomplete is not visible
        cy.get('#suggestionList').should('not.exist');

        // 6. In the modal type ~
        cy.get('#edit_textbox').type(' ~');

        // * Assert channel autocomplete is visible
        cy.get('#suggestionList').should('be.visible');

        // 6. Press the escape key
        cy.get('#edit_textbox').type('{esc}');

        // * Check if the textbox contains expected text
        cy.get('#edit_textbox').should('contain', 'Hello World! @ ~');

        // * Assert channel autocomplete is not visible
        cy.get('#suggestionList').should('not.exist');

        // 7. In the modal click the emoji picker icon
        cy.get('#editPostEmoji').click();

        // * Assert emoji picker is visible
        cy.get('#emojiPicker').should('be.visible');

        // 8. Press the escape key
        cy.get('#edit_textbox').type('{esc}');

        // * Assert emoji picker is not visible
        cy.get('#emojiPicker').should('not.exist');
    });

    it('M13482 Display correct timestamp for edited message', () => {
        // 1. Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // 2. Post a message
        cy.postMessage('Checking timestamp {enter}');

        cy.getLastPostIdWithRetry().then((postId) => {
            // 3. Mouseover post to display the timestamp
            cy.get(`#post_${postId}`).trigger('mouseover');

            cy.get(`#CENTER_time_${postId}`).find('#localDateTime').invoke('attr', 'title').then((originalTimeStamp) => {
                // 4. Click dot menu
                cy.clickPostDotMenu(postId);

                // 5. Click the edit button
                cy.get(`#edit_post_${postId}`).click();

                // * Edit modal should appear
                cy.get('.edit-modal').should('be.visible');

                // 6. Edit the post
                cy.get('#edit_textbox').type('Some text {enter}');

                // * Edit modal should disappear
                cy.get('.edit-modal').should('not.be.visible');

                // 7. Mouseover the post again
                cy.get(`#post_${postId}`).trigger('mouseover');

                // * Current post timestamp should have not been changed by edition
                cy.get(`#CENTER_time_${postId}`).find('#localDateTime').invoke('attr', 'title').should('be', originalTimeStamp);

                // 8. Open RHS by clicking the post comment icon
                cy.clickPostCommentIcon(postId);

                // * Check that the RHS is open
                cy.get('#rhsContainer').should('be.visible');

                // * Check that the RHS timeStamp equals the original post timeStamp
                cy.get(`#CENTER_time_${postId}`).find('#localDateTime').invoke('attr', 'title').should('be', originalTimeStamp);
            });
        });
    });
    it('M13542 Open edit modal immediately after making a post', () => {
        // 1. Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // 2. Post message "Hello"
        cy.get('#post_textbox').type('Hello').type('{enter}');

        // 3. Post a second message "World!"
        // 4. Hit 'enter' key and then immediately (as FAST as you can) hit 'arrow-up' to open the edit box
        cy.get('#post_textbox').type('World!{enter}{uparrow}');
        cy.get('#edit_textbox').invoke('val').then((val) => { // eslint-disable-line
            const editText = val;
            if (editText === 'Hello') {
                // 5. If pressed while the new post was still pending, observe the edit box opens for the first post
                cy.get('#editPostModal').should('be.visible');
                cy.get('#edit_textbox').type(' New message{enter}');
                cy.get('#editPostModal').should('be.not.visible');

                // Check the first post and verify that it contains new edited message.
                cy.get('.post-message__text').eq(1).should('contain', 'Hello New message');

                // Check that the second post remains unchanged with the original message.
                cy.get('.post-message__text').eq(0).should('contain', 'World!');
            } else if (editText === 'World!') {
                // 6. If the edit box open up for the second post, Enter edit text and hit enter, observe the second
                // message is changed and the first message is unchanged
                cy.get('#editPostModal').should('be.visible');

                cy.get('#edit_textbox').type(' New message{enter}');

                cy.get('#editPostModal').should('be.not.visible');

                cy.get('.post-message__text').eq(1).should('contain', 'Hello');

                // Check the second post and verify that it contains new edited message.
                cy.get('.post-message__text').eq(0).should('contain', 'World! New message');
            }
        });
    });
});
