// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Messaging', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
    });

    it('M18683-Trying to type in middle of text should not send the cursor to end of textbox', () => {
        // # Type message to use
        cy.get('#post_textbox').clear().type('aa');

        // # Move the cursor and keep typing
        cy.get('#post_textbox').click().type('{leftarrow}b');

        // # Wait for the cursor to move in failing case
        cy.wait(TIMEOUTS.SMALL);

        // # Write another letter
        cy.get('#post_textbox').type('c');

        // * Should contain abca instead of aabc or abac
        cy.get('#post_textbox').should('contain', 'abca');
    });
});
