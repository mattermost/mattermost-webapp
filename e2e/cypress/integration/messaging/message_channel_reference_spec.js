// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
    })

    it('M18707 - Autocomplete should close if tildes are deleted using backspace', () => {
        let msg = 'foo';

        // # Make a post
        cy.postMessage(msg);

        // # Hit the "up" arrow to open the edit modal
        cy.get('#post_textbox').type('{uparrow}');
        // * Edit modal opens
        cy.get('#edit_textbox').should('be.visible');

        // # Insert a tilde (~) at the beginning of the post to be edited
        cy.get('#edit_textbox').type('{ctrl}{home}').type('~');
        // * autocomplete opens
        cy.get('#suggestionList').should('be.visible');

        // # Delete the tilde by backspacing
        cy.get('#edit_textbox').type('{ctrl}{home}{rightarrow}{backspace}');
        // * autocomplete closes
        cy.get('#suggestionList').should('not.be.visible');
    });
});
