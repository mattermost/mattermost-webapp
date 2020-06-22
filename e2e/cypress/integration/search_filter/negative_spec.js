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

    function search(query) {
        cy.reload();
        cy.get('#searchBox').clear().wait(TIMEOUTS.HALF_SEC).type(query).wait(TIMEOUTS.HALF_SEC).type('{enter}');

        cy.get('#loadingSpinner').should('not.be.visible');
        cy.get('#search-items-container', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    }

    function searchAndVerify(query) {
        search(query);

        // * Verify the amount of results matches the amount of our expected results
        cy.findAllByTestId('search-item-container').should('have.length', 1).then((results) => {
            // * Verify text of each result
            cy.wrap(results).first().find('.post-message').should('have.text', message);
        });

        search(`-${query}`);

        // * If we expect no results, verify results message
        cy.get('.no-results__title').should('be.visible').and('have.text', `No results for "-${query}"`);

        cy.get('#searchResultsCloseButton').click();
        cy.get('.search-item__container').should('not.exist');
    }

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
        const query = `from:${testUser.username} ${message}`;
        searchAndVerify(query);
    });
});
