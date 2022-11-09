// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('This should fail lol', () => {
    it('Failure 1', () => {
        // * Verify that the Channels category and its channels start unmuted
        cy.get('#doesntexist').should('be.visible').should('not.have.class', 'muted');
    });

    it('Failure 2', () => {
        // * Verify that the Channels category and its channels start unmuted
        cy.get('#notmeeither').should('be.visible').should('not.have.class', 'muted');
    });
});
