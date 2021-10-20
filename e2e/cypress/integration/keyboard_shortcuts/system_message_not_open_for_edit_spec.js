// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

describe('Keyboard Shortcuts', () => {
    
    before(() => {
        cy.apiInitSetup({loginAfter: true}).then(({offTopicUrl}) => {
            // # Visit off-topic channel
            cy.visit(offTopicUrl);
        });
    });

    it('MM-T1265 UP - System message does not open for edit; opens previous regular message', () => {
        const message = 'Test message';
        const newHeader = 'New Header';

        // # Post message in the channel from User
        cy.postMessage(message);

        // # Open the edit the channel header modal
        cy.findByRole('button', {name: 'Set a Header dialog'}).click();

        // #
        cy.get('.modal').
            should('be.visible').within(() => {
                cy.findByRole('textbox', {name: 'edit the channel header...'}).
                    type(newHeader);
            });

        // * Click save button to change header
        cy.uiSave();

        // * Wait for the system message to be posted
        cy.uiWaitUntilMessagePostedIncludes(newHeader);

        // # Press UP arrow
        cy.findByTestId('post_textbox').
            type('{uparrow}');

        // * Verify that the Edit Post Modal is visible
        cy.get('#editPostModal').
            should('be.visible').
            findByRole('textbox', {name: 'edit the post...'}).
            should('have.text', message);
    });
});
