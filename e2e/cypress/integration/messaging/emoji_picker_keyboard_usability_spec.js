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
    let townsquareLink;

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            townsquareLink = `/${team.name}/channels/town-square`;
        });
    });

    beforeEach(() => {
        // # Visit the Town Square channel
        cy.visit(townsquareLink);

        // # Open emoji picker
        cy.get('#emojiPickerButton').click();

        // # Wait for emoji picker to load
        cy.get('#emojiPicker').should('be.visible');
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

    it('On up or down arrow key press, move the selection up or down the emoji items', () => {
        // * Check initial state of emoji preview
        cy.get('.emoji-picker__preview').should('have.text', 'Emoji Picker');

        // # Press down arrow and verify selected emoji
        cy.get('body').type('{downarrow}');
        cy.get('#emojiPickerAliasesPreview').should('have.text', ':grinning:');

        // # Again, press down arrow and verify next selected emoji
        cy.get('body').type('{downarrow}');
        cy.get('#emojiPickerAliasesPreview').should('have.text', ':blush:');

        // # Press up arrow and verify previously selected emoji
        cy.get('body').type('{uparrow}');
        cy.get('#emojiPickerAliasesPreview').should('have.text', ':grinning:');

        // # Again, press up arrow and nothing is selected
        cy.get('body').type('{uparrow}');
        cy.get('.emoji-picker__preview').should('have.text', 'Emoji Picker');
    });

    it('On up arrow key, move around search input or highlight the text when holding shift key', () => {
        // # Type "mi" and verify search text input
        cy.get('body').type('mi');
        cy.findByLabelText('Search for an emoji').should('have.value', 'mi');

        // # Move cursor to the beginning of search text, type "s", and then verify search text input
        cy.get('body').type('{uparrow}').type('s');
        cy.findByLabelText('Search for an emoji').should('have.value', 'smi');

        // # Move cursor to the end of the text
        cy.findByLabelText('Search for an emoji').type('{downarrow}{uparrow}');

        // * Verify that nothing is initially selected
        verifySelectedTextAs('');

        // # Highlight the text by holding shift key + up arrow, and verify that all characters are highlighted
        cy.findByLabelText('Search for an emoji').type('{shift}{uparrow}');
        verifySelectedTextAs('smi');
    });

    it('On down arrow key, move around the search input or highlight the text when holding shift key', () => {
        // # Type "sm" and verify search text input
        cy.get('body').type('sm');
        cy.findByLabelText('Search for an emoji').should('have.value', 'sm');

        // # Move cursor to the beginning then end of search text, type "i", and then verify search text input
        cy.findByLabelText('Search for an emoji').type('{uparrow}{downarrow}i').should('have.value', 'smi');

        // # Move cursor to the beginning of search text
        cy.findByLabelText('Search for an emoji').type('{uparrow}');

        // * Verify that nothing is initially selected
        verifySelectedTextAs('');

        // # Highlight the text by holding shift + arrow down, and verify that all characters are highlighted
        cy.findByLabelText('Search for an emoji').type('{shift}{downarrow}');
        verifySelectedTextAs('smi');
    });
});

function verifySelectedTextAs(text) {
    cy.document().then((doc) => {
        expect(doc.getSelection().toString()).to.eq(text);
    });
}
