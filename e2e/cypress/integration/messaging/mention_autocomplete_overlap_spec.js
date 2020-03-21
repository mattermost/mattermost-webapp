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

    it('M18667-At-mention user autocomplete does not overlap with channel header when drafting a long message containing a file attachment (standard viewport)', () => {
        // # Upload file, add message, add mention, verify no overlap
        addAutocompleteThenVerifyNoOverlap();
    });

    it('M18667-At-mention user autocomplete does not overlap with channel header when drafting a long message containing a file attachment (1280x900 viewport)', () => {
        // # Set to different viewport
        cy.viewport(1280, 900);

        // # Upload file, add message, add mention, verify no overlap
        addAutocompleteThenVerifyNoOverlap();
    });
});

function addAutocompleteThenVerifyNoOverlap() {
    // # Upload file
    cy.fileUpload('#fileUploadInput');

    // # Create and then type message to use
    cy.get('#post_textbox').clear();
    let message = 'h{shift}';
    for (let i = 0; i < 12; i++) {
        message += '{enter}h';
    }
    cy.get('#post_textbox').type(message);

    // # Add the mention
    cy.get('#post_textbox').type('{shift}{enter}').type('@');

    cy.get('#channel-header').then((header) => {
        cy.get('#suggestionList').then((list) => {
            // # Wait for suggestions to be fully loaded
            cy.wait(TIMEOUTS.TINY).then(() => {
                // * Suggestion list should visibly render just within the channel header
                expect(header[0].getBoundingClientRect().top).to.be.lessThan(list[0].getBoundingClientRect().top);
                expect(header[0].getBoundingClientRect().bottom).to.be.lessThan(list[0].getBoundingClientRect().top);
            });
        });
    });
}
