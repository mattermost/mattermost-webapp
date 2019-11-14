// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [number] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    before(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M17444 - correctly parses "://///" as Markdown and does not break the channel', () => {
        // # Go to Town Square as test channel
        cy.get('#sidebarItem_town-square').click({force: true});

        // # Validate if the channel has been opened
        cy.url().should('include', '/channels/town-square');

        // # type in the message "://///"
        const message = '://///';
        const textAfterParsed = message.substr(2);
        cy.postMessage(message);

        // # check if message sent correctly, it should parse it as 😕////"
        cy.getLastPostId().then((postId) => {
            verifyPostedMessage(postId, textAfterParsed);

            // # check if message still correctly parses after reload
            cy.reload();
            verifyPostedMessage(postId, textAfterParsed);
        });
    });

    function verifyPostedMessage(postId, text) {
        cy.get(`#postMessageText_${postId}`).should('be.visible').within((el) => {
            cy.wrap(el).should('have.text', text);
            cy.get('.emoticon').should('be.visible').and('have.attr', 'title', ':confused:');
        });
    }
});
