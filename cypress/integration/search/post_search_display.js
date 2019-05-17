// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 3]*/

describe('Post search display', () => {
    it('M14252 After clearing search query, search options display', () => {
        // 1. Login and navigate to the app
        cy.apiLogin('user-1');
        cy.visit('/');
        const searchWord = 'ok';

        // 2.search word in searchbox
        cy.get('#searchBox').type(searchWord).type('{enter}');

        // 3.searchbox should have attribute 'value'
        cy.get('#searchBox').should('have.attr', 'value', searchWord);

        // 4.click on "x" displayed on searchbox
        cy.get('#searchClearButton').click();

        // 5.click on searchbox
        cy.get('#searchBox').click();

        // 6.focused element should be searchbox
        cy.focused().should('have.attr', 'id', 'searchBox');

        // 7. search options are visible
        cy.get('#searchbar-help-popup').should('have.class', 'visible');
    });
});
