// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    before(() => {
        // # Login and navigate to town-square
        cy.toMainChannelView('user-1');

        // # Make sure that input box is clear
        getInputBox().clear();
    });

    it('M18700 - Leave a long draft in reply input box', async () => {
        // # Make sure that input box has initial height
        getInputBox().should('have.css', 'height', '46px');

        // # Write a long text in input
        getInputBox().type('test\n\n\n\n\n\n');

        // # Check that input box is taller than before
        getInputBox().should('have.css', 'height', '166px');

        // # Go to another channel
        cy.get('#sidebarItem_suscipit-4').click();

        // # Check that input box has initial height
        getInputBox().should('have.css', 'height', '46px');

        // # Return to town-square channel
        cy.get('#sidebarItem_town-square').click();

        // # Check that input box is taller again
        getInputBox().should('have.css', 'height', '166px');
    });

    const getInputBox = () => {
        return cy.get('#post_textbox');
    };
});
