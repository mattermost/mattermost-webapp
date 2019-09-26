// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Username of a test user that you want to start a DM with
const username = 'aaron.ward';
const baseUrl = Cypress.config('baseUrl');

describe('Remove Last Post', () => {
    beforeEach(() => {
        // # Login as user-1
        cy.apiLogin('user-1');
        cy.visit(`/ad-1/messages//@${username}`);
    });

    it('M18716 Remove last post in channel', () => {
        // # Post test message
        cy.postMessage('Test');

        cy.getLastPostId().then((postId) => {
            cy.clickPostDotMenu(postId);

            // # Delete the last post
            cy.get(`#delete_post_${postId}`).click();

            // # Confirm deletion
            cy.get('#deletePostModalButton').click();

            // * Check that the user has not been re-directed to another channel
            cy.url().should('eq', `${baseUrl}/ad-1/messages/@${username}`);
        });
    });
});
