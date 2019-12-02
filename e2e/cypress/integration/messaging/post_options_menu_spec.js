// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [number] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Mobile view Post menu options button in RHS', () => {
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

    it('should always be visible in the RHS for last posts and should open options modal.', () => {
        // # Get the last entered RHS post
        cy.getLastPostId().then((lastPostId) => {
            const dotMenuButtonID = `#RHS_COMMENT_button_${lastPostId}`;

            // * Check to see if button is visible
            cy.get(dotMenuButtonID).should('be.visible');

            // # Click on the options menu
            cy.get(dotMenuButtonID).click();

            const dropDownMenuOfPostOptionsID = `#RHS_COMMENT_dropdown_${lastPostId}`;

            // * Check if modal for post options have opened
            cy.get(dropDownMenuOfPostOptionsID).should('be.visible');

            cy.get(dropDownMenuOfPostOptionsID).within(() => {
                // * Check if atleast 1 item is present
                cy.get('li').should('have.length.greaterThan', 0);

                // * Check if one of the options are as follows
                cy.get('li').should('contain.text', 'Add Reaction');
                cy.get('li').should('contain.text', 'Mark as Unread');
                cy.get('li').should('contain.text', 'Permalink');
                cy.get('li').should('contain.text', 'Flag');
                cy.get('li').should('contain.text', 'Edit');
                cy.get('li').should('contain.text', 'Delete');
            });
        });
    });
});