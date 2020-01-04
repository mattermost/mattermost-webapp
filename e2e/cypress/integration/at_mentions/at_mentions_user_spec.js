// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Mention user', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M14432 autocomplete should match on spaces', () => {
        cy.get('#post_textbox').type('@Samuel Tuc');
        cy.get('.mention__fullname').should('have.text', 'Samuel Tucker');
    });
});
