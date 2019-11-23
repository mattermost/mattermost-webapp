// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    before(() => {
        // # Change viewport to tablet
        cy.viewport('ipad-2');

        // # Login and navigate to town-square
        cy.toMainChannelView('user-1');

        // # Post a new message to ensure there will be a post to click on
        cy.postMessage('Hello ' + Date.now());
    });

    it('M18705-Center channel input box does not overlap with RHS', () => {
        const maxReplyCount = 15;

        // * Check if center channel post text box is focused
        cy.get('#post_textbox').should('be.focused');

        // # Click "Reply"
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
        });

        // * Check if center channel post text box is not focused
        // Although visually post text box is not visible to user,
        // cypress still considers it visible so the assertion
        // should('not.be.visible') will fail
        cy.get('#post_textbox').should('not.be.focused');

        // # Post several replies
        cy.get('#reply_textbox').clear().should('be.visible').as('replyTextBox');
        for (let i = 1; i <= maxReplyCount; i++) {
            cy.get('@replyTextBox').type(`post ${i}`).type('{enter}');
        }

        // * Check if "Add Comment" button is visible
        cy.get('#addCommentButton').scrollIntoView().should('be.visible').and('have.value', 'Add Comment');
    });
});
