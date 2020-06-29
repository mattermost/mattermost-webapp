// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe("Click another user's emoji reaction to add it", () => {
    let townsquareLink;
    let userOne;
    let userTwo;

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({team, user}) => {
            userOne = user;
            townsquareLink = `/${team.name}/channels/town-square`;

            cy.apiCreateUser().then(({user: user2}) => {
                userTwo = user2;
                cy.apiAddUserToTeam(team.id, userTwo.id);
            });
        });
    });

    it("M15113 - Click another user's emoji reaction to add it", () => {
        // # Login as userOne and visit town-square
        cy.apiLogin(userOne);
        cy.visit(townsquareLink);

        // # Post a message
        cy.postMessage('test');

        // # Logout
        cy.apiLogout();

        // # Login as userTwo and visit town-square
        cy.apiLogin(userTwo);
        cy.visit(townsquareLink);

        // # Mouseover the last post
        cy.getLastPost().trigger('mouseover');

        cy.getLastPostId().then((postId) => {
            // # Click the add reaction icon
            cy.clickPostReactionIcon(postId);

            // # Choose "slightly_frowning_face" emoji
            cy.get('#emoji-1f641').should('be.visible').click({force: true});

            // * The number shown on the reaction is incremented by 1
            cy.get(`#postReaction-${postId}-slightly_frowning_face .post-reaction__count`).should('have.text', '1');
        });

        // # Logout
        cy.apiLogout();

        // # Login as userOne and visit town-square
        cy.apiLogin(userOne);
        cy.visit(townsquareLink);

        cy.getLastPostId().then((postId) => {
            // # Click on the "slightly_frowning_face" emoji of the last post and the background color changes
            cy.get(`#postReaction-${postId}-slightly_frowning_face`).
                should('be.visible').
                click().
                should('have.css', 'background-color').
                and('eq', 'rgba(22, 109, 224, 0.08)');

            // * The number shown on the "slightly_frowning_face" reaction is incremented by 1
            cy.get(`#postReaction-${postId}-slightly_frowning_face .post-reaction__count`).should('have.text', '2');

            // # Click on the + icon
            cy.get(`#addReaction-${postId}`).click({force: true});

            // * The reaction emoji picker is open
            cy.get('#emojiPicker').should('be.visible');

            // # Select the "scream" emoji
            cy.get('#emoji-1f631').should('be.visible').click({force: true});

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
