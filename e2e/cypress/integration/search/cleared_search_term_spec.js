// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @search

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Search', () => {
    const term = 'London';

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
            cy.postMessage(term);
            cy.uiWaitUntilMessagePostedIncludes(term);
        });
    });

    it('MM-T352 - Cleared search term should not reappear as RHS is opened and closed', () => {
        // # Place the focus on the search box and search for something
        cy.get('#searchFormContainer').should('be.visible').click();
        cy.get('#searchBox').should('be.visible').
            type(`${term}{enter}`).
            wait(TIMEOUTS.ONE_SEC).
            clear();
        cy.get('#searchbar-help-popup').should('be.visible');
        cy.get('#searchFormContainer').type('{esc}');

        // # Verify the Search side bar opens up
        cy.get('#sidebar-right').should('be.visible').and('contain', 'Search Results');

        // # Close the search side bar
        // * Verify the Search side bar is closed
        cy.get('#searchResultsCloseButton').should('be.visible').click();
        cy.get('#sidebar-right').should('not.be.visible');

        // # Verify that the cleared search text does not appear on the search box
        cy.get('#searchBox').should('be.visible').and('be.empty');

        // # Click the pin icon to open the pinned posts RHS
        cy.get('#channelHeaderPinButton').should('be.visible').click();
        cy.get('#sidebar-right').should('be.visible').and('contain', 'Pinned Posts');

        // # Verify that the Search term input box is still cleared and search term does not reappear when RHS opens
        cy.get('#searchBox').should('have.attr', 'value', '').and('be.empty');
    });
});
