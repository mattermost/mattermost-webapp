// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Check if writing in the middle of the message does not cause cursor to go to the end of line', function() {
    before(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });
    it('checks', () => {

        // # Clearing text box
        cy.get('#post_textbox').clear();

        // # Typing message
        cy.get('#post_textbox').type('aa');

        // # Moving to the middle of it
        cy.get('#post_textbox').type('{leftarrow}');

        // # Trying to type
        cy.get('#post_textbox').type('bb');

        // # Giving time for cursor to move if it would do it
        cy.wait(3000);

        // * Checking if cursor is still in the middle of the message
        cy.get('#post_textbox').type('cc').should('have.value', 'abbcca');
    })
});