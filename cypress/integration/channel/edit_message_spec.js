// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Edit Message', () => {
    it('Escape should not close modal when an autocomplete drop down is in use', () => {
        // 1. Login as "user-1" and go to /
        cy.login('user-1');
        cy.visit('/');

        // 2. Post message "Hello"
        cy.get('#post_textbox').type('Hello World!').type('{enter}');

        // 3. Hit the up arrow to open the "edit modal"
        cy.get('#post_textbox').type('{uparrow}');

        // 4. In the modal type @
        cy.get('#edit_textbox').type(' @');

        // * Assert user autocomplete is visible
        cy.get('#suggestionList').should('be.visible');

        // 5. Press the escape key
        cy.get('#edit_textbox').type('{esc}');

        // * Assert user autocomplete is not visible
        cy.get('#suggestionList').should('not.exist');

        // 6. In the modal type ~
        cy.get('#edit_textbox').type(' ~');

        // * Assert channel autocomplete is visible
        cy.get('#suggestionList').should('be.visible');

        // 6. Press the escape key
        cy.get('#edit_textbox').type('{esc}');

        // * Assert channel autocomplete is not visible
        cy.get('#suggestionList').should('not.exist');

        // 7. In the modal click the emoji picker icon
        cy.get('#editPostEmoji').click();

        // * Assert emoji picker is visible
        cy.get('#emojiPicker').should('be.visible');

        // 8. Press the escape key
        cy.get('#edit_textbox').type('{esc}');

        // * Assert emoji picker is not visible
        cy.get('#emojiPicker').should('not.exist');
    });
});
