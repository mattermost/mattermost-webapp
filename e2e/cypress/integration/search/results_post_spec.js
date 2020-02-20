// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Search', () => {
    before(() => {
        // # Login and navigate to the app
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
    });

    it('S19944 Highlighting does not change to what is being typed in the search input box', () => {
        const apple = `apple${Date.now()}`;
        const banana = `banana${Date.now()}`;

        const message = apple + ' ' + banana;

        // # Post a message as "apple" and "banana"
        cy.postMessage(message);

        // # Search for "apple"
        cy.get('#searchBox').should('be.visible').type(apple).type('{enter}');

        // # Get last postId
        cy.getLastPostId().as('lastPostId');

        // * Search result should return one post with highlight on apple
        cy.get('@lastPostId').then((postId) => {
            verifySearchResult(1, postId, message, apple);
        });

        // * Type banana on search box but don't hit search
        cy.get('#searchBox').clear({force: true}).type(banana, {force: true});

        // * Search result should not change and remain as one result with highlight still on apple
        cy.get('@lastPostId').then((postId) => {
            verifySearchResult(1, postId, message, apple);
        });
    });
});

function verifySearchResult(results, postId, fullMessage, highlightedTerm) {
    cy.queryAllByTestId('search-item-container').should('have.length', results).within(() => {
        cy.get(`#rhsPostMessageText_${postId}`).should('have.text', `${fullMessage}`);
        cy.get('.search-highlight').should('be.visible').and('have.text', highlightedTerm);
    });
}
