
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Post Header', () => {
    let testTeam;

    before(() => {
        // # Login as test user and visit town-square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;

            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    beforeEach(() => {
        cy.visit(`/${testTeam.name}/channels/town-square`);
    });

    it('should render permalink view on click of post timestamp at center view', () => {
        // # Post a message
        cy.postMessage('test for permalink');

        cy.getLastPostId().then((postId) => {
            const divPostId = `#post_${postId}`;

            // * Check initial state that the first message posted is not highlighted
            cy.get(divPostId).should('be.visible').should('not.have.class', 'post--highlight');

            // # Click timestamp of a post
            cy.clickPostTime(postId);

            // * Check if url include the permalink
            cy.url().should('include', `/${testTeam.name}/channels/town-square/${postId}`);

            // * Check if url redirects back to parent path eventually
            cy.wait(TIMEOUTS.FIVE_SEC).url().should('include', `/${testTeam.name}/channels/town-square`).and('not.include', `/${postId}`);

            // * Check that the post is highlighted on permalink view
            cy.get(divPostId).should('be.visible').and('have.class', 'post--highlight');

            // * Check that the highlight is removed after a period of time
            cy.wait(TIMEOUTS.HALF_SEC).get(divPostId).should('be.visible').and('not.have.class', 'post--highlight');

            // * Check the said post not highlighted
            cy.get(divPostId).should('be.visible').should('not.have.class', 'post--highlight');
        });
    });

    it('should flag a post on click to flag icon at center view', () => {
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
        // # Post a message
        cy.postMessage('test for dropdown menu');

        cy.getLastPostId().then((postId) => {
            // * Check that the center dot menu' button and dropdown are hidden
            cy.get(`#post_${postId}`).should('be.visible').within(() => {
                cy.get(`#CENTER_button_${postId}`).should('not.be.visible');
                cy.get('.dropdown-menu').should('not.be.visible');
            });

            // # Click dot menu of a post
            cy.clickPostDotMenu(postId);

            // * Check that the center dot menu button and dropdown are visible
            cy.get(`#post_${postId}`).should('be.visible').within(() => {
                cy.get(`#CENTER_button_${postId}`).should('be.visible');
                cy.get('.dropdown-menu').should('be.visible');
            });

            // # Click to other location like post textbox
            cy.get('#post_textbox').click();

            // * Check that the center dot menu and dropdown are hidden
            cy.get(`#post_${postId}`).should('be.visible').within(() => {
                cy.get(`#CENTER_button_${postId}`).should('not.be.visible');
                cy.get('.dropdown-menu').should('not.be.visible');
            });
        });
    });

    it('should open and close Emoji Picker on click of reaction icon', () => {
        // # Post a message
        cy.postMessage('test for reaction and emoji picker');

        cy.getLastPostId().then((postId) => {
            // * Check that the center post reaction icon and emoji picker are not visible
            cy.get(`#CENTER_reaction_${postId}`).should('not.exist');
            cy.get('#emojiPicker').should('not.exist');

            // # Click the center post reaction icon of the post
            cy.clickPostReactionIcon(postId);

            // * Check that the center post reaction icon of the post becomes visible
            cy.get(`#CENTER_reaction_${postId}`).should('be.visible').and('have.class', 'post-menu__item--active').and('have.class', 'post-menu__item--reactions');

            // * Check that the emoji picker becomes visible as well
            cy.get('#emojiPicker').should('be.visible');

            // # Click again the center post reaction icon of the post
            cy.clickPostReactionIcon(postId);

            // # Click on textbox to focus away from emoji area
            cy.get('#post_textbox').click();

            // * Check that the center post reaction icon and emoji picker are not visible
            cy.get(`#CENTER_reaction_${postId}`).should('not.exist');
            cy.get('#emojiPicker').should('not.exist');
        });
    });

    it('should open RHS on click of comment icon and close on RHS\' close button', () => {
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
        // # Post a message
        cy.postMessage('test for pinning/unpinning a post');

        cy.getLastPostId().then((postId) => {
            // * Check that the center flag icon of the post is not visible
            cy.get(`#CENTER_flagIcon_${postId}`).should('not.exist');

            // * Check that the pinned badge of the post is not visible
            cy.get(`#post_${postId}`).should('not.have.class', 'post--pinned');

            // # Pin the post.
            cy.getPostMenu(postId, 'Pin to Channel').click();

            // # Click the center flag icon of a post
            cy.clickPostFlagIcon(postId);

            // # click RHS list
            cy.get('#channelHeaderFlagButton').click();

            // * Check that message exists in RHS flagged posts list
            cy.get(`#rhsPostMessageText_${postId}`).contains('test for pinning/unpinning a post');

            // * Check that post is be pinned in center
            // * Check that post is be pinned in RHS
            cy.get(`#post_${postId}`).should('have.class', 'post--pinned');
            cy.get(`#SEARCH_flagIcon_${postId}`).siblings('.post__pinned-badge').should('exist');

            // # unpin the post
            cy.getPostMenu(postId, 'Unpin from Channel').click();

            // * Check that message exists in RHS flagged posts list
            // * Check that post is not be pinned in center
            // * Check that post is not be pinned in RHS
            cy.get(`#rhsPostMessageText_${postId}`).contains('test for pinning/unpinning a post');
            cy.get(`#post_${postId}`).should('not.have.class', 'post--pinned');
            cy.get(`#SEARCH_flagIcon_${postId}`).siblings('.post__pinned-badge').should('not.exist');

            // # Pin the post again.
            cy.getPostMenu(postId, 'Pin to Channel').click();

            // * Check that post is be pinned in center
            // * Check that post is be pinned in RHS
            cy.get(`#post_${postId}`).should('have.class', 'post--pinned');
            cy.get(`#SEARCH_flagIcon_${postId}`).siblings('.post__pinned-badge').should('exist');
        });
    });

    it('M17442 Visual verification of "Searching" animation for Flagged and Pinned posts', () => {
        cy.delayRequestToRoutes(['pinned', 'flagged'], 5000);
        cy.reload();

        // Pin and flag last post before clicking on Pinned and Flagged post icons
        cy.postMessage('Post');

        //Pin and flag the posted message
        cy.getLastPostId().then((postId) => {
            cy.clickPostDotMenu(postId);
            cy.get(`#pin_post_${postId}`).click();
            cy.clickPostFlagIcon(postId);
        });

        // # Click on the "Pinned Posts" icon to the left of the "Search" box
        cy.get('#channelHeaderPinButton').click();

        // * Verify that the RHS for pinned posts is opened.
        cy.get('#searchContainer').should('be.visible').within(() => {
            // * Check that searching indicator appears before the pinned posts are loaded
            cy.get('#loadingSpinner', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').and('have.text', 'Searching...');
            cy.get('#search-items-container').should('be.visible');

            // # Close the RHS
            cy.get('#searchResultsCloseButton').should('be.visible').click();
        });

        // # Click on the "Flagged Posts" icon to the right of the "Search" box
        cy.get('#channelHeaderFlagButton').click();

        // * Verify that the RHS for pinned posts is opened.
        cy.get('#searchContainer').should('be.visible').within(() => {
            // * Check that searching indicator appears before the pinned posts are loaded
            cy.get('#loadingSpinner').should('be.visible').and('have.text', 'Searching...');
            cy.get('#search-items-container').should('be.visible');

            // # Close the RHS
            cy.get('#searchResultsCloseButton').should('be.visible').click();
        });
    });
});
