// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Scroll channel`s messages in mobile view', () => {
    before(() => {
        cy.apiLogin('user-1');

        // # resize browser to phone view
        cy.viewport('iphone-6');

        // # visit channel that has message on different days
        cy.visit('ad-1/channels/minima-3');
    });

    it('M18759 - detect change in floating timestamp', () => {

        // # scroll to previous date
        cy.findAllByTestId('BasicSeparator').last().scrollIntoView();

        // * check date on scroll and save it
        cy.get('[data-testid="post-list__timestamp"] span span').
            should('have.text', 'Wed, Dec 18, 2019').and('be.visible').as('date1');

        // # scroll to first date in this channel
        cy.findAllByTestId('BasicSeparator').first().scrollIntoView();

        // * verify that date changed
        cy.get('[data-testid="post-list__timestamp"] span span').
            should('not.have.text', '@date1').and('be.visible');
    });
});
