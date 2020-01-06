// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    before(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // # resize window to mobile view
        cy.viewport('iphone-6');
    });

    it('M18677 - Clicking on airplane icon does not open file attachment modal but sends the message', () => {
        // # type some characters in the message box
        const message = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';
        cy.get('#post_textbox').clear().type(message);

        // # click send
        cy.get('.send-button').click();

        // # check if message sent correctly
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('be.visible').and('have.text', message);
        });

        // # attachment modal does not show up
        cy.get('.a11y__popup').should('not.exist');
    });
});
