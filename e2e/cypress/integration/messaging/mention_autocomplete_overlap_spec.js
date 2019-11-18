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

    it('M18667-At-mention user autocomplete does not overlap with channel header when drafting a long message containing a file attachment', () => {
        cy.visit('/ad-1/channels/town-square');

        // # Upload file
        cy.fileUpload('#fileUploadInput');

        // # Create and then type message to use
        let message = 'h{shift}';
        cy.get('#post_textbox').clear();
        for (let i = 0; i < 12; i++) {
            message += '{enter}h';
        }
        cy.get('#post_textbox').type(message);

        // # Put cursor on top and add the mention
        let returnMessage = '';
        for (let i = 0; i < 12; i++) {
            returnMessage += '{uparrow}';
        }
        cy.get('#post_textbox').type(returnMessage + '{leftarrow}@');

        cy.get('#suggestionList').then((list) => {
            cy.get('#channel-header').then((header) => {
                // # Wait for suggestions to be fully loaded
                cy.wait(TIMEOUTS.TINY).then(() => {
                    // * Check overlap
                    expect(header[0].getBoundingClientRect().bottom).be.lte(list[0].getBoundingClientRect().top);
                });
            });
        });
    });
});
