// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Autocomplete in the search box - scrolling', () => {
    const usersCount = 15;
    const timestamp = Date.now();

    before(() => {
        // # Create new team for tests
        cy.apiCreateTeam(`search-${timestamp}`, `search-${timestamp}`).then(({team}) => {
            // # Create pool of users for tests
            for (let i = 0; i < usersCount; i++) {
                cy.apiCreateUser().then(({user}) => {
                    cy.apiAddUserToTeam(team.id, user.id);
                });
            }
            cy.visit(`/${team.name}/channels/town-square`);
            cy.postMessage('hello'); // fix for https://github.com/mattermost/mattermost-webapp/pull/8084#issuecomment-844852168
        });
    });

    it('MM-T4084 correctly scrolls when the user navigates through options with the keyboard', () => {
        cy.get('#searchBox').type('from:');

        cy.get('#search-autocomplete__popover .search-autocomplete__item').first().as('firstItem');
        cy.get('#search-autocomplete__popover .search-autocomplete__item').last().as('lastItem');

        cy.get('@firstItem').should('be.visible');
        cy.get('@lastItem').should('not.be.visible');
        cy.get('body').type('{downarrow}'.repeat(usersCount));
        cy.get('@firstItem').should('not.be.visible');
        cy.get('@lastItem').should('be.visible');
        cy.get('body').type('{uparrow}'.repeat(usersCount));
        cy.get('@firstItem').should('be.visible');
        cy.get('@lastItem').should('not.be.visible');
    });
});
