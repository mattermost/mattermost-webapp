// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [#] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Messaging', () => {
    before(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
        cy.get('#post_textbox').clear();
    });
    it('M23348 - Selecting an emoji from emoji picker should insert it at the cursor position', () => {
        // # Write some text in the send box.
        cy.get('#post_textbox').type('HelloWorld!');

        // # Move the cursor to the middle of the text.
        cy.get('#post_textbox').type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}');

        // # Select the grinning emoji from the emoji picker.
        cy.get('#emojiPickerButton').click();
        cy.get('img[data-testid="grinning"]').click();

        // * The emoji should be inserted where the cursor is at the time of selection.
        cy.get('#post_textbox').should('have.value', 'Hello :grinning: World!');
        cy.get('#post_textbox').type('{enter}');

        // * The emoji should be displayed in the post at the position inserted.
        cy.getLastPost().find('p').should('have.html', `Hello <span data-emoticon="grinning"><span alt=":grinning:" class="emoticon" title=":grinning:" style="background-image: url(&quot;${Cypress.config('baseUrl')}/static/emoji/1f600.png&quot;);"></span></span> World!`);
    });
});