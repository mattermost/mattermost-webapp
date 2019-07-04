// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Edit Message', () => {
    beforeEach(() => {
        // # Login as "user-1"
        cy.apiLogin('user-1');
    });

    it('M13909 Escape should not close modal when an autocomplete drop down is in use', () => {
        // # and go to /
        cy.visit('/');

        // # Post message "Hello"
        cy.postMessage('Hello World!');

        // # Hit the up arrow to open the "edit modal"
        cy.get('#post_textbox').type('{uparrow}');

        // # In the modal type @
        cy.get('#edit_textbox').type(' @');

        // * Assert user autocomplete is visible
        cy.get('#suggestionList').should('be.visible');

        // # Press the escape key
        cy.get('#edit_textbox').wait(TIMEOUTS.TINY).focus().type('{esc}');

        // * Check if the textbox contains expected text
        cy.get('#edit_textbox').should('have.value', 'Hello World! @');

        // * Assert user autocomplete is not visible
        cy.get('#suggestionList').should('not.exist');

        // # In the modal type ~
        cy.get('#edit_textbox').type(' ~');

        // * Assert channel autocomplete is visible
        cy.get('#suggestionList').should('be.visible');

        // # Press the escape key
        cy.get('#edit_textbox').wait(TIMEOUTS.TINY).type('{esc}');

        // * Check if the textbox contains expected text
        cy.get('#edit_textbox').should('have.value', 'Hello World! @ ~');

        // * Assert channel autocomplete is not visible
        cy.get('#suggestionList').should('not.exist');

        // # In the modal click the emoji picker icon
        cy.get('#editPostEmoji').click();

        // * Assert emoji picker is visible
        cy.get('#emojiPicker').should('be.visible');

        // * Press the escape key
        cy.get('#edit_textbox').wait(TIMEOUTS.TINY).type('{esc}');

        // * Assert emoji picker is not visible
        cy.get('#emojiPicker').should('not.exist');
    });

    it('M13482 Display correct timestamp for edited message', () => {
        // # and go to /
        cy.visit('/');

        // # Post a message
        cy.postMessage('Checking timestamp');

        cy.getLastPostId().then((postId) => {
            // # Mouseover post to display the timestamp
            cy.get(`#post_${postId}`).trigger('mouseover');

            cy.get(`#CENTER_time_${postId}`).find('#localDateTime').invoke('attr', 'title').then((originalTimeStamp) => {
                // # Click dot menu
                cy.clickPostDotMenu(postId);

                // # Click the edit button
                cy.get(`#edit_post_${postId}`).click();

                // # Edit modal should appear
                cy.get('.edit-modal').should('be.visible');

                // # Edit the post
                cy.get('#edit_textbox').type('Some text {enter}');

                // * Edit modal should disappear
                cy.get('.edit-modal').should('not.be.visible');

                // # Mouseover the post again
                cy.get(`#post_${postId}`).trigger('mouseover');

                // * Current post timestamp should have not been changed by edition
                cy.get(`#CENTER_time_${postId}`).find('#localDateTime').should('have.attr', 'title').and('equal', originalTimeStamp);

                // # Open RHS by clicking the post comment icon
                cy.clickPostCommentIcon(postId);

                // * Check that the RHS is open
                cy.get('#rhsContainer').should('be.visible');

                // * Check that the RHS timeStamp equals the original post timeStamp
                cy.get(`#CENTER_time_${postId}`).find('#localDateTime').invoke('attr', 'title').should('be', originalTimeStamp);
            });
        });
    });

    it('M13542 Open edit modal immediately after making a post when post is pending', () => {
        // # and go to /. We set fetch to null here so that we can intercept XHR network requests
        cy.visit('/', {
            onBeforeLoad: (win) => {
                win.fetch = null;
            },
        });

        // # Enter first message
        cy.get('#post_textbox').clear().type('Hello{enter}');

        // Start a server, and stub out the response to ensure we have a pending post
        // Note that this fails the creation of the second post. But we only need it
        // to be pending
        cy.server();
        cy.route({response: {}, method: 'POST', url: 'api/v4/posts', delay: 5000});

        // # Enter second message, submit, and then uparrow to show edit post modal
        cy.get('#post_textbox').type('world!{enter}{uparrow}');

        // * Edit post modal should appear, and edit the post
        cy.get('#editPostModal').should('be.visible');
        cy.get('#edit_textbox').should('have.text', 'Hello').type(' New message{enter}');
        cy.get('#editPostModal').should('be.not.visible');

        // * Verify last post is pending
        cy.getLastPostId({force: true}).should('contain', ':');
    });

    it('M15519 Open edit modal immediately after making a post when post is pending', () => {
        // # and go to /. We set fetch to null here so that we can intercept XHR network requests
        cy.visit('/');

        // # Enter first message
        cy.postMessage('Hello');

        // * Verify first message is sent and not pending
        cy.getLastPostId().then((postId) => {
            const postText = `#postMessageText_${postId}`;
            cy.get(postText).should('have.text', 'Hello');
        });

        // # Enter second message
        cy.postMessage('World!');

        // * Verify second message is sent and not pending
        cy.getLastPostId().then((postId) => {
            const postText = `#postMessageText_${postId}`;
            cy.get(postText).should('have.text', 'World!');

            // # Edit the last post
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear, and edit the post
            cy.get('#editPostModal').should('be.visible');
            cy.get('#edit_textbox').should('have.text', 'World!').type(' Another new message{enter}');
            cy.get('#editPostModal').should('be.not.visible');

            // * Check the second post and verify that it contains new edited message.
            cy.get(postText).should('have.text', 'World! Another new message');
        });
    });
});

