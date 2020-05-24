// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod @smoke
// Group: @messaging

import users from '../../fixtures/users.json';

describe('Emoji reactions to posts/messages', () => {
    it('adding a reaction to a post is visible to another user in the channel', () => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        // # Post a message
        cy.postMessage('The reaction to this post should be visible to user-2');

        // # Mouseover the last post
        cy.getLastPost().trigger('mouseover');

        cy.getLastPostId().then((postId) => {
            // # Click the add reaction icon
            cy.clickPostReactionIcon(postId);

            // # Choose "slightly_frowning_face" emoji
            // delaying 500ms in case of lag
            cy.get('.emoji-picker__items #emoji-1f641').wait(500).click();

            // * The number shown on the reaction is incremented by 1
            cy.get(`#postReaction-${postId}-slightly_frowning_face .Reaction__number--display`).
                should('have.text', '1').
                should('be.visible');
        });

        // # Logout
        cy.apiLogout();

        // # Login as "user-2" and go to /
        const user2 = users['user-2'];
        cy.apiLogin(user2.username, user2.password);
        cy.visit('/ad-1/channels/town-square');

        cy.getLastPostId().then((postId) => {
            // * user-1's reaction "slightly_frowning_face" is visible and is equal to 1
            cy.get(`#postReaction-${postId}-slightly_frowning_face .Reaction__number--display`).
                should('have.text', '1').
                should('be.visible');
        });
    });
    it('another user adding to existing reaction increases reaction count', () => {
        cy.getLastPostId().then((postId) => {
            // # Click on the "slightly_frowning_face" emoji
            cy.get(`#postReaction-${postId}-slightly_frowning_face`).click();

            // * The number shown on the "slightly_frowning_face" reaction is incremented by 1
            cy.get(`#postReaction-${postId}-slightly_frowning_face .Reaction__number--display`).
                should('have.text', '2').
                should('be.visible');
        });
    });
    it('a reaction added by current user has highlighted background color', () => {
        cy.getLastPostId().then((postId) => {
            // # The "slightly_frowning_face" emoji of the last post and the background color changes
            cy.get(`#postReaction-${postId}-slightly_frowning_face`).
                should('be.visible').
                should('have.css', 'background-color').
                and('eq', 'rgba(22, 109, 224, 0.08)');
        });
    });
    it("can click another user's reaction to detract from it", () => {
        cy.getLastPostId().then((postId) => {
            // * The number shown on the "slightly_frowning_face" reaction is currently at 2
            cy.get(`#postReaction-${postId}-slightly_frowning_face .Reaction__number--display`).
                should('have.text', '2').
                should('be.visible');

            // # Click on the "slightly_frowning_face" emoji
            cy.get(`#postReaction-${postId}-slightly_frowning_face`).click();

            // * The number shown on the "slightly_frowning_face" reaction  is decremented by 1
            cy.get(`#postReaction-${postId}-slightly_frowning_face .Reaction__number--display`).
                should('have.text', '1').
                should('be.visible');
        });
    });
    it('can add a reaction to a post with an existing reaction', () => {
        cy.getLastPostId().then((postId) => {
            // # Click on the + icon
            cy.get(`#addReaction-${postId}`).click({force: true});

            // * The reaction emoji picker is open
            cy.get('#emojiPicker').should('be.visible');

            // # Select the "sweat_smile" emoji
            // delaying 500ms in case of lag
            cy.get('.emoji-picker__items #emoji-1f605').wait(500).click();

            // * The emoji picker is no longer open
            cy.get('#emojiPicker').should('be.not.visible');

            // * The "sweat_smile" emoji is added to the post
            cy.get(`#postReaction-${postId}-sweat_smile`).should('be.visible');
        });
    });
    it('can remove a reaction to a post with an existing reaction', () => {
        cy.getLastPostId().then((postId) => {
            // * The "sweat_smile" should exist on the post
            cy.get(`#postReaction-${postId}-sweat_smile`).should('be.visible');

            // # Click on the "sweat_smile" emoji
            cy.get(`#postReaction-${postId}-sweat_smile`).click();

            // * The "sweat_smile" emoji is removed
            cy.get(`#postReaction-${postId}-sweat_smile`).should('be.not.visible');
        });
    });
});
