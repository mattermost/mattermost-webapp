
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Post Header', () => {
    before(() => {
        // # Go to Main Channel View with "user-1"
        cy.toMainChannelView('user-1');
    });

    it('should render permalink view on click of post timestamp at center view', () => {
        // # Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // # Post a message
        cy.postMessage('test for permalink');

        // * Check initial state that "the jump to recent messages" is not visible
        cy.get('#archive-link-home').should('not.be.visible');

        cy.getLastPostId().then((postId) => {
            const divPostId = `#post_${postId}`;

            // * Check initial state that the first message posted is not highlighted
            cy.get(divPostId).should('be.visible').should('not.have.class', 'post--highlight');

            // # Click timestamp of a post
            cy.clickPostTime(postId);

            // * Check that it redirected to permalink URL
            cy.url().should('include', `/ad-1/pl/${postId}`);

            // * Check that the post is highlighted on permalink view
            cy.get(divPostId).should('be.visible').should('have.class', 'post--highlight');

            // * Check that the "jump to recent messages" is visible
            cy.get('#archive-link-home').
                should('be.visible').
                should('contain', 'Click here to jump to recent messages.');

            // # Click "jump to recent messages" link
            cy.get('#archive-link-home').click();

            // * Check that it redirects to channel URL
            cy.url().should('include', '/ad-1/channels/town-square');

            // * Check the said post not highlighted
            cy.get(divPostId).should('be.visible').should('not.have.class', 'post--highlight');
        });
    });

    it('should flag a post on click to flag icon at center view', () => {
        // # Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // # Post a message
        cy.postMessage('test for flagged post');

        cy.getLastPostId().then((postId) => {
            // * Check that the center flag icon of a post is not visible
            cy.get(`#CENTER_flagIcon_${postId}`).should('not.be.visible');

            // # Click the center flag icon of a post
            cy.clickPostFlagIcon(postId);

            // * Check that the center flag icon of a post becomes visible
            cy.get(`#CENTER_flagIcon_${postId}`).should('be.visible').should('have.class', 'style--none flag-icon__container visible');

            // # Click again the center flag icon of a post
            cy.clickPostFlagIcon(postId);

            // # Click on textbox to focus away from flag area
            cy.get('#post_textbox').click();

            // * Check that the center flag icon of a post is now hidden.
            cy.get(`#CENTER_flagIcon_${postId}`).should('not.be.visible');
        });
    });

    it('should open dropdown menu on click of dot menu icon', () => {
        // # Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // # Post a message
        cy.postMessage('test for dropdown menu');

        cy.getLastPostId().then((postId) => {
            // * Check that the center dot menu' button and dropdown are hidden
            cy.get(`#CENTER_button_${postId}`).should('not.be.visible');
            cy.get(`#CENTER_dropdown_${postId}`).should('not.be.visible');

            // # Click dot menu of a post
            cy.clickPostDotMenu();

            // * Check that the center dot menu button and dropdown are visible
            cy.get(`#CENTER_button_${postId}`).should('be.visible');
            cy.get(`#CENTER_dropdown_${postId}`).should('be.visible');

            // # Click to other location like post textbox
            cy.get('#post_textbox').click();

            // * Chack that the center dot menu and dropdown are hidden
            cy.get(`#CENTER_button_${postId}`).should('not.be.visible');
            cy.get(`#CENTER_dropdown_${postId}`).should('not.be.visible');
        });
    });

    it('should open and close Emoji Picker on click of reaction icon', () => {
        // # Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // # Post a message
        cy.postMessage('test for reaction and emoji picker');

        cy.getLastPostId().then((postId) => {
            // * Check that the center post reaction icon and emoji picker are not visible
            cy.get(`#CENTER_reaction_${postId}`).should('not.be.visible');
            cy.get('#emojiPicker').should('not.be.visible');

            // # Click the center post reaction icon of the post
            cy.clickPostReactionIcon(postId);

            // * Check that the center post reaction icon of the post becomes visible
            cy.get(`#CENTER_reaction_${postId}`).should('be.visible').should('have.attr', 'class', 'reacticon__container color--link style--none');

            // * Check that the emoji picker becomes visible as well
            cy.get('#emojiPicker').should('be.visible');

            // # Click again the center post reaction icon of the post
            cy.clickPostReactionIcon(postId);

            // # Click on textbox to focus away from emoji area
            cy.get('#post_textbox').click();

            // * Check that the center post reaction icon and emoji picker are not visible
            cy.get(`#CENTER_reaction_${postId}`).should('not.be.visible');
            cy.get('#emojiPicker').should('not.be.visible');
        });
    });

    it('should open RHS on click of comment icon and close on RHS\' close button', () => {
        // # Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // # Post a message
        cy.postMessage('test for opening and closing RHS');

        // # Open RHS on hover to a post and click to its comment icon
        cy.clickPostCommentIcon();

        // * Check that the RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // # Close RHS on click of close button
        cy.closeRHS();

        // * Check that the RHS is close
        cy.get('#rhsContainer').should('not.be.visible');
    });

    it('M14577 Un-pinning and pinning a post removes and adds badge', () => {
        // # Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // # Post a message
        cy.postMessage('test for pinning/unpinning a post');

        cy.getLastPostId().then((postId) => {
            // * Check that the center flag icon of the post is not visible
            cy.get(`#CENTER_flagIcon_${postId}`).should('not.be.visible');

            // * Check that the pinned badge of the post is not visible
            cy.get(`#post_${postId}`).should('not.have.class', 'post--pinned');

            // # Pin the post.
            cy.clickPostDotMenu(postId);
            cy.get(`#pin_post_${postId}`).should('be.visible').click();

            // # Click the center flag icon of a post
            cy.clickPostFlagIcon(postId);

            // # click RHS list
            cy.get('#channelHeaderFlagButton').click();

            // * Check that message exists in RHS flagged posts list
            cy.get(`#postMessageText_${postId}`).contains('test for pinning/unpinning a post');

            // * Check that post is be pinned in center
            // * Check that post is be pinned in RHS
            cy.get(`#post_${postId}`).should('have.class', 'post--pinned');
            cy.get(`#SEARCH_flagIcon_${postId}`).siblings('.post__pinned-badge').should('exist');

            // # unpin the post
            cy.clickPostDotMenu(postId);
            cy.get(`#unpin_post_${postId}`).should('be.visible').click();

            // * Check that message exists in RHS flagged posts list
            // * Check that post is not be pinned in center
            // * Check that post is not be pinned in RHS
            cy.get(`#postMessageText_${postId}`).contains('test for pinning/unpinning a post');
            cy.get(`#post_${postId}`).should('not.have.class', 'post--pinned');
            cy.get(`#SEARCH_flagIcon_${postId}`).siblings('.post__pinned-badge').should('not.exist');

            // # Pin the post again.
            cy.clickPostDotMenu(postId);
            cy.get(`#pin_post_${postId}`).should('be.visible').click();

            // * Check that post is be pinned in center
            // * Check that post is be pinned in RHS
            cy.get(`#post_${postId}`).should('have.class', 'post--pinned');
            cy.get(`#SEARCH_flagIcon_${postId}`).siblings('.post__pinned-badge').should('exist');
        });
    });
});
