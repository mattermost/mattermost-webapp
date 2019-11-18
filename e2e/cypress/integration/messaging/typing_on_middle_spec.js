// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M18683-Trying to type in middle of text should not send the cursor to end of textbox', () => {
        cy.visit('/ad-1/channels/town-square');

        // # Type message to use
        cy.get('#post_textbox').clear().type('aa');

        // # Move the cursor and keep typing
        cy.get('#post_textbox').click().type('{leftarrow}b');

        // * Should contain aba instead of aab
        cy.get('#post_textbox').should('contain', 'aba');
    });
});
