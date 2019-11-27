// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Negative search filters will omit results', () => {
    const message = 'negative' + Date.now();

    function search(query) {
        cy.reload();
        cy.get('#searchBox').clear().wait(500).type(query).wait(500).type('{enter}');

        cy.get('#loadingSpinner').should('not.be.visible');
        cy.get('#search-items-container', {timeout: TIMEOUTS.HUGE}).should('be.visible');
    }

    function searchAndVerify(query) {
        search(query);

        // * Verify the amount of results matches the amount of our expected results
        cy.queryAllByTestId('search-item-container').should('have.length', 1).then((results) => {
            // * Verify text of each result
            cy.wrap(results).first().find('.post-message').should('have.text', message);
        });

        search(`-${query}`);

        // * If we expect no results, verify results message
        cy.get('#noResultsMessage').should('be.visible').and('have.text', 'No results found. Try again?');

        cy.get('#searchResultsCloseButton').click();
        cy.get('.search-item__container').should('not.exist');
    }

    before(() => {
        // # Login as the sysadmin.
        cy.apiLogin('sysadmin');

        // # Create a new team
        cy.apiCreateTeam('filter-test', 'filter-test').its('body').as('team');

        // # Get team name and visit that team
        cy.get('@team').then((team) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });

        // # Create a post from today
        cy.get('#postListContent', {timeout: TIMEOUTS.LARGE}).should('be.visible');
        cy.postMessage(message);
    });

    it('just search query', () => {
        searchAndVerify(message);
    });

    it('-before:', () => {
        const tomorrow = Cypress.moment().add(1, 'days').format('YYYY-MM-DD');
        const query = `before:${tomorrow} ${message}`;
        searchAndVerify(query);
    });

    it('-after:', () => {
        const yesterday = Cypress.moment().subtract(1, 'days').format('YYYY-MM-DD');
        const query = `after:${yesterday} ${message}`;
        searchAndVerify(query);
    });

    it('-on:', () => {
        const today = Cypress.moment().format('YYYY-MM-DD');
        const query = `on:${today} ${message}`;
        searchAndVerify(query);
    });

    it('-in:', () => {
        const query = `in:town-square ${message}`;
        searchAndVerify(query);
    });

    it('-from:', () => {
        const query = `from:sysadmin ${message}`;
        searchAndVerify(query);
    });
});
