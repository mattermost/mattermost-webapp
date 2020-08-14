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

    it('MM-T173 Edit post with "strikethrough" and ensure channel auto-complete closes after second tilde (~~)', () => {
        const message = 'Hello' + Date.now();

        // # Post message to use
        cy.postMessage(message);

        // # Hit up arrow to open edit modal
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).clear().type('{uparrow}').wait(TIMEOUTS.HALF_SEC);

        // # Type first tilde (a{backspace} used so cursor is in the textbox and {home} gets us to the beginning of the line)
        cy.get('#edit_textbox').type('a{backspace}{home}~').wait(TIMEOUTS.HALF_SEC);

        // # Channel autocomplete should show
        cy.get('#suggestionList').should('exist');

        // # Write the second tilde
        cy.get('#edit_textbox').type('{home}{rightarrow}~').wait(TIMEOUTS.HALF_SEC);

        // * Channel autocomplete should have closed
        cy.get('#suggestionList').should('not.exist');

        // # Go to the end of the line and type the first tilde
        cy.get('#edit_textbox').type('{end} ~').wait(TIMEOUTS.HALF_SEC);

        // # Channel autocomplete should show
        cy.get('#suggestionList').should('exist');

        // # Write the second tilde
        cy.get('#edit_textbox').type('{end}~').wait(TIMEOUTS.HALF_SEC);

        // * Channel autocomplete should close
        cy.get('#suggestionList').should('not.exist');

        // # Remove the whitespace
        cy.get('#edit_textbox').type('{end}{leftarrow}{leftarrow}{backspace}').wait(TIMEOUTS.HALF_SEC);

        // * Channel autocomplete should still not exist
        cy.get('#suggestionList').should('not.exist');

        // # Save the changes
        cy.get('#editButton').click({force: true});

        cy.getLastPostId().then((postId) => {
            // * Message strikedthrough should be the same message we posted
            cy.get(`#postMessageText_${postId}`).find('del').should('contain', message).
                and('have.css', 'text-decoration', 'line-through solid rgb(61, 60, 64)');
            cy.get(`#postEdited_${postId}`).should('be.visible').and('have.text', '(edited)');
        });
    });
});
