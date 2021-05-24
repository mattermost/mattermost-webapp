// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Message reply scrollable', () => {
    before(() => {
        // # Login as test user and visit town-square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // # Post a new message to ensure there will be a post to click on
            cy.postMessage('Hello ' + Date.now());
        });

        // # Click "Reply"
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
        });

        // # Post several replies and verify last reply
        for (let i = 1; i <= 15; i++) {
            cy.postMessageReplyInRHS(`post ${i}`);
        }
    });

    it('MM-T4083_1 correctly scrolls to the bottom when a thread is opened', () => {
        // # Scroll RHS to top and close it
        cy.get('.post-right__scroll').scrollIntoView();
        cy.closeRHS();

        // # Open RHS
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
        });

        // * Check that after opening RHS it's scrolled to bottom
        cy.get('#addCommentButton').should('be.visible');
    });

    it('MM-T4083_2 correctly scrolls to the bottom when the user types in the comment box', () => {
        // # Scroll RHS to top
        cy.get('.post-right__scroll').scrollIntoView();

        // # Type into comment box
        cy.get('#reply_textbox').type('foo', {scrollBehavior: false}); // without scrollBehavior=false cypress automatically scrolls to replyTextBox. We need to check if application does that.

        // * Check if RHS scrolled to bottom
        cy.get('#addCommentButton').should('be.visible');
    });
});
