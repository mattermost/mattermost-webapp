// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [number] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    beforeEach(() => {
        // # resize window to mobile view
        cy.viewport('iphone-6');

        // # Login and navigate to town-square
        cy.toMainChannelView('user-1');

        // # Post a new message to ensure there will be a post to click on
        cy.postMessage('Hello ' + Date.now());

        // # Click "Reply"
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
        });

        // # Enter valid text into RHS
        const replyValid = 'Hi ' + Date.now();
        cy.postMessageReplyInRHS(replyValid);
    });

    it('M18679 - Mobile view: Post options menu (3-dots) is present on a reply post in RHS', () => {
        // # Get the last entered RHS post
        cy.getLastPostId().then((lastPostId) => {
            const dotMenuButtonID = `#RHS_COMMENT_button_${lastPostId}`;

            // * Check to see if button is visible and click it
            cy.get(dotMenuButtonID).should('be.visible').click();

            const dropDownMenuOfPostOptionsID = `#RHS_COMMENT_dropdown_${lastPostId}`;

            // * Check if modal for post options have opened
            cy.get(dropDownMenuOfPostOptionsID).should('be.visible').within(() => {
                // * Check if atleast 1 item is present
                cy.get('li').should('have.length.greaterThan', 0);

                // * Check if one of the options are as follows
                cy.findByText('Add Reaction').should('be.visible');
                cy.findByText('Mark as Unread').should('be.visible');
                cy.findByText('Copy Link').should('be.visible');
                cy.findByText('Flag').should('be.visible');
                cy.findByText('Pin to Channel').should('be.visible');
                cy.findByText('Edit').should('be.visible');
                cy.findByText('Delete').should('be.visible');
            });
        });
    });
});
