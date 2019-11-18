// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import uuid from 'uuid/v4';
const PAGE_SIZE = 10;

describe('Search teams', () => {
    beforeEach(() => {
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/user_management/teams');
    });

    it('loads with no search text', () => {
        cy.get('[data-test=search-input]').should('be.visible').and('have.text', '');
    });

    it('returns results', () => {
        const displayName = uuid();
        cy.apiCreateTeam('team-search', displayName);
        cy.get('[data-test=search-input]').type(displayName + '{enter}');
        cy.get('[data-test=team-display-name]').contains(displayName);
    });

    it('results are paginated', () => {
        const displayName = uuid();

        // make enough teams for 2 pages of results
        for (let i = 0; i < PAGE_SIZE + 2; i++) {
            cy.apiCreateTeam('team-search-paged-' + i, displayName + ' ' + i);
        }

        cy.get('[data-test=search-input]').type(displayName + '{enter}');

        // page 1 has PAGE_SIZE items
        cy.get('[data-test=team-display-name]').should('have.length', PAGE_SIZE);

        // page 2 has 2 items
        cy.get('[data-test=page-link-next]').should('be.enabled').click();
        cy.get('[data-test=team-display-name]').should('have.length', 2);
    });

    it('clears the results when "x" is clicked', () => {
        const displayName = uuid();
        cy.apiCreateTeam('team-search', displayName);
        cy.get('[data-test=search-input]').as('searchInput').type(displayName + '{enter}');
        cy.get('[data-test=team-display-name]').should('have.length', 1);

        cy.get('[data-test=clear-search]').click();
        cy.get('@searchInput').should('be.visible').and('have.text', '');
        cy.get('[data-test=team-display-name]').should('have.length', PAGE_SIZE);
    });

    it('clears the results when the search term is deleted with backspace', () => {
        const displayName = uuid();
        cy.apiCreateTeam('team-search', displayName);
        cy.get('[data-test=search-input]').as('searchInput').type(displayName + '{enter}');
        cy.get('[data-test=team-display-name]').should('have.length', 1);

        cy.get('@searchInput').type('{selectall}{del}');
        cy.get('[data-test=team-display-name]').should('have.length', PAGE_SIZE);
    });
});
