// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @search

describe('Post search display', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('S14252 After clearing search query, search options display', () => {
        const searchWord = 'Hello';

        // # post message
        cy.postMessage(searchWord);

        // # search word in searchBox and validate searchWord
        cy.get('#searchBox').type(searchWord).type('{enter}').should('have.value', searchWord);

        // # click on "x" displayed on searchbox
        cy.get('#searchbarContainer').should('be.visible').within(() => {
            cy.get('#searchFormContainer').find('.input-clear-x').click({force: true});
            cy.get('#searchbar-help-popup').should('be.visible');
            cy.get('#searchFormContainer').type('{esc}');
        });

        // # RHS should be visible with search results
        cy.get('#search-items-container').should('be.visible');

        // # click on searchbox
        cy.get('#searchbarContainer').should('be.visible').within(() => {
            cy.get('#searchBox').click();
        });

        // # check the contents in search options
        cy.get('#searchbar-help-popup').should('be.visible').within(() => {
            cy.get('h4 span').first().should('have.text', 'Search Options');
            cy.get('div ul li').first().should('have.text', 'From:Messages from a user');
            cy.get('div ul li').eq(1).should('have.text', 'In:Messages in a channel');
            cy.get('div ul li').eq(2).should('have.text', 'On:Messages on a date');
            cy.get('div ul li').eq(3).should('have.text', 'Before:Messages before a date');
            cy.get('div ul li').eq(4).should('have.text', 'After:Messages after a date');
            cy.get('div ul li').eq(5).should('have.text', '—Exclude search terms');
            cy.get('div ul li').last().should('have.text', '""Messages with phrases');
        });
    });
});
