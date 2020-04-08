// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [#] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe('MM-13064 - Emoji picker keyboard usability', () => {
    before(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
    });

    beforeEach(() => {
        // # Open emoji picker
        cy.get('#emojiPickerButton').click();

        // # Wait for emoji picker to load
        cy.get('#emojiPicker').should('be.visible');
    });

    afterEach(() => {
        // # Close emoji picker by clicking on body
        cy.get('body').click();
    });

    it('If the left arrow key is pressed while focus is on the emoji picker text box, the cursor should move left in the text', () => {
        cy.findByLabelText('Search for an emoji').
            should('be.visible').
            and('have.focus').
            type('si').
            should('have.value', 'si').
            type('{leftarrow}m').
            should('have.value', 'smi');
    });

    it('If the right arrow key is pressed when the cursor is at the end of the word in the text box, move the selection to the right in the emoji picker, otherwise move the cursor to the right in the text', () => {
        // * Should highlight and preview the first emoji ("smile") on right arrow key
        cy.findByLabelText('Search for an emoji').
            should('be.visible').
            and('have.focus').
            type('si').
            should('have.value', 'si').
            type('{leftarrow}m').
            should('have.value', 'smi').
            type('{rightarrow}l').
            should('have.value', 'smil').
            type('{rightarrow}');
        cy.get('.emoji-picker__item.selected').should('exist').within(() => {
            cy.findByTestId('smile').should('exist');
        });
        cy.get('#emojiPickerAliasesPreview').should('have.text', ':smile:');

        // * Should highlight and preview the second emoji ("smile_cat") on second right arrow key
        cy.findByLabelText('Search for an emoji').
            should('have.focus').
            and('have.value', 'smil').
            type('{rightarrow}').
            should('have.value', 'smil');
        cy.get('.emoji-picker__item.selected').should('exist').within(() => {
            cy.findByTestId('smile_cat').should('exist');
        });
        cy.get('#emojiPickerAliasesPreview').should('have.text', ':smile_cat:');
    });

    xit('If the down arrow key is pressed at any time, move the selection down in the emoji picker');
    xit('If the up arrow is pressed when the emoji selector is already on the top row of emoji, set the cursor to the beginning of the string. Otherwise, up arrow moves the emoji selector up a row');
    xit('If CTRL/CMD + Arrow Left/Up is pressed at any time, set the cursor to the beginning of the string when the cursor is at the end of the string');
    xit('If CTRL/CMD + Arrow Right/Down is pressed at any time, set the cursor to the end of the string when the cursor is at the beginning of the string');
    xit('If Shift + Arrow Left/Right is pressed at any time, should select or deselect individual characters based on the cursor position and if characters have or have not been selected');
    xit('If Shift + CTRL/CMD + Arrow Left/Up is pressed at any time, selects the string to the left of the cursor');
    xit('If Shift + CTRL/CMD + Arrow Right/Down is pressed at any time, selects the string to the right of the cursor');
});
