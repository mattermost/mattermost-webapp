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
import * as MESSAGES from '../../fixtures/messages';

describe('Search', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('QuickInput clear X', () => {
        // # Wait for the page to be completely loaded
        cy.wait(TIMEOUTS.FIVE_SEC);

        // * X should not be visible on empty input
        cy.get('#searchFormContainer').find('.input-clear-x').should('not.be.visible');

        // # Write something on the input
        cy.get('#searchBox').clear().type('abc');

        // * The input should contain what we wrote
        cy.get('#searchBox').should('have.value', 'abc');

        // * The X should be visible
        cy.get('#searchFormContainer').find('.input-clear-x').should('be.visible');

        // # Click the X to clear the input field
        cy.get('#searchFormContainer').find('.input-clear-x').click({force: true});

        // * The X should not be visible since the input is cleared
        cy.get('#searchFormContainer').find('.input-clear-x').should('not.be.visible');

        // * The value of the input is empty
        cy.get('#searchBox').should('have.value', '');
    });

    it('MM-T368 - Text in search box should not clear when Pinned or Saved posts icon is clicked', () => {
        const searchText = MESSAGES.SMALL;

        // * Verify search input field exists and not search button, as inputs contains placeholder not buttons/icons
        // and then type in a search text
        cy.findByPlaceholderText('Search').should('be.visible').and('exist').click().type(searchText).as('searchInput');

        // # Click on the pinned post button from the header
        cy.get('#channel-header').within(() => {
            cy.findByLabelText('Pin Icon').should('be.visible').and('exist').click();
        });

        // * Verify the pinned post RHS is open
        cy.get('#sidebar-right').should('be.visible').and('contain', 'Pinned posts');

        // * Check that search input value remains the same as we entered before
        cy.get('@searchInput').should('have.value', searchText);

        // # Now click on the saved post button from the header
        cy.get('#channel-header').within(() => {
            cy.findByLabelText('Save Icon').should('be.visible').and('exist').click();
        });

        // * Verify the pinned post RHS is open
        cy.get('#sidebar-right').should('be.visible').and('contain', 'Saved posts');

        // * Again check that search input value remains the same as we entered before
        cy.get('@searchInput').should('have.value', searchText);

        // # Close the Saved posts RHS
        cy.get('#sidebar-right').within(() => {
            cy.findByLabelText('Close').should('be.visible').and('exist').click();
        });
    });
});
