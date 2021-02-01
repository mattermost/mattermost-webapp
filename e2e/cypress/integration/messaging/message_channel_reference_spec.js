// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Messaging', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T174 Autocomplete should close if tildes are deleted using backspace', () => {
        const msg = 'foo';

        // # Make a post
        cy.postMessage(msg);

        // # Hit the "up" arrow to open the edit modal
        cy.get('#post_textbox').type('{uparrow}');

        // # Insert a tilde (~) at the beginning of the post to be edited
        cy.get('#edit_textbox').should('be.visible').wait(TIMEOUTS.HALF_SEC).type('{home}~');

        // * autocomplete opens
        cy.get('#suggestionList').should('be.visible');

        // # Delete the tilde by backspacing
        cy.get('#edit_textbox').type('{home}{rightarrow}{backspace}');

        // * autocomplete closes
        cy.get('#suggestionList').should('not.be.visible');

        // close the edit modal
        cy.get('#editButton').click();
    });
});
