// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 3]*/

describe('Post search display', () => {
    it('S14252 After clearing search query, search options display', () => {
        // # Login and navigate to the app
        cy.apiLogin('user-1');
        cy.visit('/');
        const searchWord = 'Hello';

        // # post message
        cy.postMessage(searchWord);

        // # search word in searchBox and validate searchWord
        cy.get('#searchBox').type(searchWord).type('{enter}').should('have.value', searchWord);

        // # click on "x" displayed on searchbox
        cy.get('#searchClearButton').click();

        // # RHS should be visible with search results
        cy.get('.sidebar-right__body').should('be.visible');

        // # focused element searchbox should be visible
        cy.get('#searchBox').should('be.visible');

        // # click on searchbox
        cy.get('#searchBox').click();

        // # search options menu is visible
        cy.get('#searchbar-help-popup').should('be.visible');

        // # check the contents in search options
        cy.get('#searchbar-help-popup').should('contain', 'Search Options');
        cy.get('#searchbar-help-popup').should('contain', 'Use "quotation marks" to search for phrases');
    });
});
