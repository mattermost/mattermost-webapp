// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @search

import {getRandomId} from '../../utils';

describe('Search', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // # Post several messages of similar format to add complexity in searching
            Cypress._.times(5, () => {
                cy.postMessage(`asparagus${getRandomId()}`);
            });
        });
    });

    it('S14548 Search results Right-Hand-Side: Post a comment', () => {
        const message = `asparagus${getRandomId()}`;
        const comment = 'Replying to asparagus';

        // # Post a new message
        cy.postMessage(message);

        // # Search for the text we just entered
        cy.uiSearchPosts(message);

        // # Get last postId
        cy.getLastPostId().then((postId) => {
            const postMessageText = `#rhsPostMessageText_${postId}`;

            // * Search results should have our original message
            cy.get('#search-items-container').find(postMessageText).should('have.text', `${message}`);

            // # Click on the reply button on the search result
            cy.clickPostCommentIcon(postId, 'SEARCH');

            // # Reply with a comment
            cy.get('#reply_textbox').type(`${comment}{enter}`);

            // * Verify sidebar is still open
            cy.get('#rhsContainer').should('be.visible');

            // * Verify that the original message is in the RHS
            cy.get('#rhsContainer').find(postMessageText).should('have.text', `${message}`);
        });

        // # Get the comment id
        cy.getLastPostId().then((commentId) => {
            const rhsCommentText = `#rhsPostMessageText_${commentId}`;
            const mainCommentText = `#postMessageText_${commentId}`;

            // * Verify comment in RHS
            cy.get('#rhsContainer').find(rhsCommentText).should('have.text', `${comment}`);

            // * Verify comment main thread
            cy.get('#postListContent').find(mainCommentText).should('have.text', `${comment}`);
        });
    });
});
