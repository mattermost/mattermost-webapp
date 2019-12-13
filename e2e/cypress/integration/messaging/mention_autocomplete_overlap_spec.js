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
        cy.visit('/');
    });

    it('M18667-At-mention user autocomplete does not overlap with channel header when drafting a long message containing a file attachment (standard viewport)', () => {
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

        cy.get('#suggestionList').then((list) => {
            cy.get('#channel-header').then((header) => {
                // # Wait for suggestions to be fully loaded
                cy.wait(TIMEOUTS.TINY).then(() => {
                    // * Suggestion list should visibly render just within the channel header
                    expect(list[0].getBoundingClientRect().top).to.be.greaterThan(header[0].getBoundingClientRect().top);
                    expect(list[0].getBoundingClientRect().top).to.be.lessThan(header[0].getBoundingClientRect().bottom);
                });
            });
        });
    });

    it('M18667-At-mention user autocomplete does not overlap with channel header when drafting a long message containing a file attachment (1280x900 viewport)', () => {
        cy.viewport(1280, 900);

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

        cy.get('#suggestionList').then((list) => {
            cy.get('#channel-header').then((header) => {
                // # Wait for suggestions to be fully loaded
                cy.wait(TIMEOUTS.TINY).then(() => {
                    // * Check overlap
                    expect(list[0].getBoundingClientRect().top).to.be.at.least(header[0].getBoundingClientRect().bottom);
                });
            });
        });
    });
});
