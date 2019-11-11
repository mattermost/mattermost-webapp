// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [number] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Message', () => {
    before(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('MM-17444 - correctly parses "://///" as Markdown and does not break the channel', () => {
        // # Go to Town Square as test channel
        cy.get('#sidebarItem_town-square').click({force: true});

        // # Validate if the channel has been opened
        cy.url().should('include', '/channels/town-square');

        // # type in the message "://///"
        const message = '://///';
        cy.postMessage(message);

        // # check if message sent correctly
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('be.visible').and('have.text', message);
        });

        // # reload page
        cy.reload();

        // # check if message sent correctly
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('be.visible').and('have.text', message);
        });
    });
});
