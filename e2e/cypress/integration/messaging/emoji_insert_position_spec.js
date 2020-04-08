// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [#] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe('Messaging', () => {
    before(() => {
    // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
        cy.get('#post_textbox').clear();
    });
    it('M23348 - Selecting an emoji from emoji picker should insert it at the cursor position', () => {
        cy.get('#post_textbox').type('HelloWorld!');
        cy.get('#post_textbox').type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}');
        cy.get('#emojiPickerButton').click();
        cy.get('img[data-testid="grinning"]').click();
        cy.get('#post_textbox').should('have.value', 'Hello :grinning: World!');
        cy.get('#post_textbox').type('{enter}');
        cy.getLastPost().find('p').contains('Hello World!');
        cy.getLastPost().find('p').children();
        cy.getLastPost().find('p').find('span[data-emoticon="grinning"]').should('be.visible');
    });
});