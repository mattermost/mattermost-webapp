// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @search_date_filter

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Negative search filters will omit results', () => {
    const message = 'negative' + Date.now();
    let testUser;

    before(() => {
        // # Login as test user and go to town-square
        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            testUser = user;

            cy.visit(`/${team.name}/channels/town-square`);

            // # Create a post from today
            cy.get('#postListContent', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible');
            cy.postMessage(message);
        });
    });

    it('MM-T607 Negative search term', () => {
        searchAndVerify(message, message);
    });

    it('MM-T608 Negative before: filter', () => {
        const tomorrow = Cypress.moment().add(1, 'days').format('YYYY-MM-DD');
        const query = `before:${tomorrow} ${message}`;
        searchAndVerify(query, message);
    });

    it('MM-T609 Negative after: filter', () => {
        const yesterday = Cypress.moment().subtract(1, 'days').format('YYYY-MM-DD');
        const query = `after:${yesterday} ${message}`;
        searchAndVerify(query, message);
    });

    it('MM-T611 Negative on: filter', () => {
        const today = Cypress.moment().format('YYYY-MM-DD');
        const query = `on:${today} ${message}`;
        searchAndVerify(query, message);
    });

    it('MM-T3996 Negative in: filter', () => {
        const query = `in:town-square ${message}`;
        searchAndVerify(query, message);
    });

    it('MM-T610 Negative from: filter', () => {
        const query = `from:${testUser.username} ${message}`;
        searchAndVerify(query, message);
    });
});

function search(query) {
    cy.reload();
    cy.get('#searchBox').clear().wait(TIMEOUTS.HALF_SEC).type(query).wait(TIMEOUTS.HALF_SEC).type('{enter}');

    cy.get('#loadingSpinner').should('not.exist');
    cy.get('#search-items-container', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
}

function searchAndVerify(query, expectedMessage) {
    search(query);

    // * Verify the amount of results matches the amount of our expected results
    cy.findAllByTestId('search-item-container').should('have.length', 1).then((results) => {
        // * Verify text of each result
        cy.wrap(results).first().find('.post-message').should('have.text', expectedMessage);
    });

    search(`-${query}`);

    // * If we expect no results, verify results message
    cy.get('.no-results__title').should('be.visible').and('have.text', `No results for "-${query}"`);

    cy.get('#searchResultsCloseButton').click();
    cy.get('.search-item__container').should('not.exist');
}
