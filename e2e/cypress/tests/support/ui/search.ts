// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from 'tests/types';

const uiSearchPosts = (searchTerm: string): ChainableT<Cypress.cy> => {
    // # Enter the search terms and hit enter to start the search
    cy.get('#searchBox').clear().type(searchTerm).type('{enter}');

    // * Wait for the RHS to open and the search results to appear
    cy.contains('.sidebar--right__header', 'Search Results').should('be.visible');
    cy.get('#searchContainer .LoadingSpinner').should('not.exist');
    return cy;
};
Cypress.Commands.add('uiSearchPosts', uiSearchPosts);

const uiJumpToSearchResult = (postId: string): ChainableT<Cypress.cy> => {
    // # Find the post in the search results and click Jump
    cy.get(`#searchResult_${postId}`).contains('a', 'Jump').click();

    // * Verify the URL changes to the permalink URL
    cy.url().should((url) => url.endsWith(`/${postId}`));

    // * Verify that the permalinked post is highlighted in the center channel
    cy.get(`#post_${postId}.post--highlight`).should('be.visible');
    return cy;
};
Cypress.Commands.add('uiJumpToSearchResult', uiJumpToSearchResult);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            uiSearchPosts: typeof uiSearchPosts;
            uiJumpToSearchResult: typeof uiJumpToSearchResult;
        }
    }
}
