// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 3] */

describe('Post Header', () => {
    before(() => {
        // 1. Go to Main Channel View with "user-1"
        cy.toMainChannelView('user-1');
    });

    it('should render permalink view on click of post timestamp at center view', () => {
        // 2. Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // 3. Post a message
        cy.postMessage('test for permalink{enter}');

        // * Check initial state that "the jump to recent messages" is not visible
        cy.get('#archive-link-home').should('not.be.visible');

        cy.getLastPostId().then((postId) => {
            const divPostId = `#post_${postId}`;

            // * Check initial state that the first message posted is not highlighted
            cy.get(divPostId).should('be.visible').should('have.attr', 'class', 'post same--user same--root  current--user');

            // 4. Click timestamp of a post
            cy.clickPostTime(postId);

            // * Check that it redirected to permalink URL
            cy.url().should('include', `/ad-1/pl/${postId}`);

            // * Check that the post is highlighted on permalink view
            cy.get(divPostId).should('be.visible').should('have.attr', 'class', 'post post--highlight same--user same--root  current--user');

            // * Check that the "jump to recent messages" is visible
            cy.get('#archive-link-home').
                should('be.visible').
                should('contain', 'Click here to jump to recent messages.');

            // 5. Click "jump to recent messages" link
            cy.get('#archive-link-home').click();

            // * Check that it redirects to channel URL
            cy.url().should('include', '/ad-1/channels/town-square');

            // * Check the said post not highlighted
            cy.get(divPostId).should('be.visible').should('have.attr', 'class', 'post same--user same--root  current--user');
        });
    });

    it('should flag a post on click to flag icon at center view', () => {
        // 2. Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // 3. Post a message
        cy.postMessage('test for flagged post{enter}');

        cy.getLastPostId().then((postId) => {
            // * Check that the center flag icon of a post is not visible
            cy.get(`#centerPostFlag_${postId}`).should('not.be.visible');

            // 4. Click the center flag icon of a post
            cy.clickPostFlagIcon(postId);

            // * Check that the center flag icon of a post becomes visible
            cy.get(`#centerPostFlag_${postId}`).should('be.visible').should('have.attr', 'class', 'style--none flag-icon__container visible');

            // 5. Click again the center flag icon of a post
            cy.clickPostFlagIcon(postId);

            // * Check that the center flag icon of a post is now hidden.
            cy.get(`#centerPostFlag_${postId}`).should('not.be.visible');
        });
    });

    it('should open dropdown menu on click of dot menu icon', () => {
        // 2. Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // 3. Post a message
        cy.postMessage('test for dropdown menu{enter}');

        cy.getLastPostId().then((postId) => {
            // * Check that the center dot menu' button and dropdown are hidden
            cy.get(`#CENTER_button_${postId}`).should('not.be.visible');
            cy.get(`#CENTER_dropdown_${postId}`).should('not.be.visible');

            // 4. Click dot menu of a post
            cy.clickPostDotMenu();

            // * Check that the center dot menu button and dropdown are visible
            cy.get(`#CENTER_button_${postId}`).should('be.visible');
            cy.get(`#CENTER_dropdown_${postId}`).should('be.visible');

            // 5. Click to other location like post textbox
            cy.get('#post_textbox').click();

            // * Chack that the center dot menu and dropdown are hidden
            cy.get(`#CENTER_button_${postId}`).should('not.be.visible');
            cy.get(`#CENTER_dropdown_${postId}`).should('not.be.visible');
        });
    });

    it('should open and close Emoji Picker on click of reaction icon', () => {
        // 2. Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // 3. Post a message
        cy.postMessage('test for reaction and emoji picker{enter}');

        cy.getLastPostId().then((postId) => {
            // * Check that the center post reaction icon and emoji picker are not visible
            cy.get(`#CENTER_reaction_${postId}`).should('not.be.visible');
            cy.get('#emojiPicker').should('not.be.visible');

            // 4. Click the center post reaction icon of the post
            cy.clickPostReactionIcon(postId);

            // * Check that the center post reaction icon of the post becomes visible
            cy.get(`#CENTER_reaction_${postId}`).should('be.visible').should('have.attr', 'class', 'reacticon__container color--link style--none');

            // * Check that the emoji picker becomes visible as well
            cy.get('#emojiPicker').should('be.visible');

            // 5. Click again the center post reaction icon of the post
            cy.clickPostReactionIcon(postId);

            // * Check that the center post reaction icon and emoji picker are not visible
            cy.get(`#CENTER_reaction_${postId}`).should('not.be.visible');
            cy.get('#emojiPicker').should('not.be.visible');
        });
    });

    it('should open RHS on click of comment icon and close on RHS\' close button', () => {
        // 2. Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // 3. Post a message
        cy.postMessage('test for opening and closing RHS{enter}');

        // 4. Open RHS on hover to a post and click to its comment icon
        cy.clickPostCommentIcon();

        // * Check that the RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // 5. Close RHS on click of close button
        cy.closeRHS();

        // * Check that the RHS is close
        cy.get('#rhsContainer').should('not.be.visible');
    });
});
