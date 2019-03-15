// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 4]*/

describe('Message', () => {
    it('M13326 Text in bullet points is the same size as text above and below it', () => {
        // 1. Login and navigate to the app
        cy.login('user-1');
        cy.visit('/');

        // 2. Enter in text
        const messageText = `
This is a normal sentence.

1. this is point 1
    - this is a bullet under 1

This is more normal text.`;

        cy.postMessage(messageText);

        // 3. Get last postId
        cy.getLastPostId().then((postId) => {
            const postMessageTextId = `#postMessageText_${postId}`;

            //  * Verify text sizes
            cy.get(postMessageTextId).within(() => {
                const expectedSize = '13.5px';

                cy.get('p').first().should('have.text', 'This is a normal sentence.').and('have.css', 'font-size', expectedSize);
                cy.get('ol li').first().should('have.text', 'this is point 1\nthis is a bullet under 1\n').and('have.css', 'font-size', expectedSize);
                cy.get('ol li ul li').should('have.text', 'this is a bullet under 1').and('have.css', 'font-size', expectedSize);
                cy.get('p').last().should('have.text', 'This is more normal text.').and('have.css', 'font-size', expectedSize);
            });
        });
    });
});