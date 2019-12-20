// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import TIMEOUTS from '../../fixtures/timeouts';

describe('Search', () => {
    before(() => {
        // # Login as the sysadmin.
        cy.apiLogin('sysadmin');
        cy.visit('/');
    });

    it('QuickInput clear X', () => {
        // # Wait for the page to be completely loaded
        cy.wait(TIMEOUTS.SMALL);

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
});
