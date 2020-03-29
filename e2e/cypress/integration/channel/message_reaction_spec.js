// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

describe("Click another user's emoji reaction to add it", () => {
    it("M15113 - Click another user's emoji reaction to add it", () => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        // # Post a message
        cy.postMessage('test');

        // # Logout
        cy.apiLogout();

        // # Login as "user-2" and go to /
        const user2 = users['user-2'];
        cy.apiLogin(user2.username, user2.password);
        cy.visit('/ad-1/channels/town-square');

        // # Mouseover the last post
        cy.getLastPost().trigger('mouseover');

        cy.getLastPostId().then((postId) => {
            // # Click the add reaction icon
            cy.clickPostReactionIcon(postId);

            // # Choose "slightly_frowning_face" emoji
            cy.get('#emoji-1f641').click();

            // * The number shown on the reaction is incremented by 1
            cy.get(`#postReaction-${postId}-slightly_frowning_face .post-reaction__count`).should('have.text', '1');
        });

        // # Logout
        cy.apiLogout();

        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        cy.getLastPostId().then((postId) => {
            // # Click on the "slightly_frowning_face" emoji of the last post and the background color changes
            cy.get(`#postReaction-${postId}-slightly_frowning_face`).
                should('be.visible').
                click().
                should('have.css', 'background-color').
                and('eq', 'rgba(35, 137, 215, 0.1)');

            // * The number shown on the "slightly_frowning_face" reaction is incremented by 1
            cy.get(`#postReaction-${postId}-slightly_frowning_face .post-reaction__count`).should('have.text', '2');

            // # Click on the + icon
            cy.get(`#addReaction-${postId}`).click({force: true});

            // * The reaction emoji picker is open
            cy.get('#emojiPicker').should('be.visible');

            // # Select the "scream" emoji
            cy.get('#emoji-1f631').click();

            // * The emoji picker is no longer open
            cy.get('#emojiPicker').should('be.not.visible');

            // * The "scream" emoji is added to the post
            cy.get(`#postReaction-${postId}-scream`).should('be.visible');

            // # Click on the "slightly_frowning_face" emoji
            cy.get(`#postReaction-${postId}-slightly_frowning_face .post-reaction__emoji`).click();

            // * The number shown on the "slightly_frowning_face" reaction  is decremented by 1
            cy.get(`#postReaction-${postId}-slightly_frowning_face .post-reaction__count`).should('have.text', '1');

            // # Click on the "scream" emoji
            cy.get(`#postReaction-${postId}-scream .post-reaction__emoji`).click();

            // * The "scream" emoji is removed
            cy.get(`#postReaction-${postId}-scream`).should('be.not.visible');
        });
    });
});
