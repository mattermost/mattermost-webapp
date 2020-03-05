// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Post search display', () => {
    it('S14252 After clearing search query, search options display', () => {
        // # Login and navigate to the app
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
        const searchWord = 'Hello';

        // # post message
        cy.postMessage(searchWord);

        // # search word in searchBox and validate searchWord
        cy.get('#searchBox').type(searchWord).type('{enter}').should('have.value', searchWord);

        // # click on "x" displayed on searchbox
        cy.get('#searchbarContainer').should('be.visible').within(() => {
            cy.get('#searchFormContainer').find('.input-clear-x').click({force: true});
        });

        // # RHS should be visible with search results
        cy.get('#search-items-container').should('be.visible');

        // # click on searchbox
        cy.get('#searchbarContainer').should('be.visible').within(() => {
            cy.get('#searchBox').click();
        });

        // # check the contents in search options
        cy.get('#searchbar-help-popup').within(() => {
            cy.get('h4 span').first().should('have.text', 'Search Options');
            cy.get('span ul li').first().should('have.text', 'Use "quotation marks" to search for phrases');
            cy.get('span ul li').eq(1).should('have.text', 'Use from: to find posts from specific users');
            cy.get('span ul li').eq(2).should('have.text', 'Use in: to find posts in specific channels');
            cy.get('span ul li').eq(3).should('have.text', 'Use on: to find posts on a specific date');
            cy.get('span ul li').eq(4).should('have.text', 'Use before: to find posts before a specific date');
            cy.get('span ul li').eq(5).should('have.text', 'Use after: to find posts after a specific date');
            cy.get('span ul li').last().should('have.text', 'Use dash "-" to exclude search terms and modifiers');
        });
    });
});
