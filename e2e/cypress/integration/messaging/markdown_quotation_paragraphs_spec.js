// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M18703-Markdown quotation paragraphs', () => {
        const messageParts = ['this is', 'really', 'three quote lines'];
        const message = `>${messageParts[0]}\n\n>${messageParts[1]}\n\n>${messageParts[2]}`;

        cy.visit('/ad-1/channels/town-square');

        // # Post message to use
        cy.postMessage(message);

        var firstPartLeft;
        cy.getLastPostId().then((postId) => {
            // * There is only one blockquote, and therefore only one Quote icon
            cy.get(`#postMessageText_${postId} > blockquote`).should('have.length', 1);

            // * There are three distinct paragraphs, and therefore the three of them are separated by a space
            cy.get(`#postMessageText_${postId} > blockquote > p`).should('have.length', 3);
            cy.get(`#postMessageText_${postId} > blockquote > p`).each((el, i) => {
                // * Each paragraph contains the content we put on the message
                expect(messageParts[i]).equals(el.html());

                // # We save the alignment of the first paragraph
                if (i === 0) {
                    firstPartLeft = el[0].getBoundingClientRect().left;
                }

                // * All paragraph are aligned on their left border
                expect(firstPartLeft).equals(el[0].getBoundingClientRect().left);
            });
        });
    });
});
