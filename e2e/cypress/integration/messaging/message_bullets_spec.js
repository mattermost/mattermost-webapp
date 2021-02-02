// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe('Message', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T87 Text in bullet points is the same size as text above and below it', () => {
        // # Post a message
        cy.get('#post_textbox').clear().
            type('This is a normal sentence.').
            type('{shift}{enter}{enter}').
            type('1. this is point 1').
            type('{shift}{enter}').
            type(' - this is a bullet under 1').
            type('{shift}{enter}{enter}').
            type('This is more normal text.').
            type('{enter}');

        // # Get last postId
        cy.getLastPostId().then((postId) => {
            const postMessageTextId = `#postMessageText_${postId}`;

            //  * Verify text sizes
            cy.get(postMessageTextId).within(() => {
                const expectedSize = '13.5px';

                cy.get('p').first().should('have.text', 'This is a normal sentence.').and('have.css', 'font-size', expectedSize);
                cy.get('ol li').first().should('have.text', 'this is point 1\nthis is a bullet under 1').and('have.css', 'font-size', expectedSize);
                cy.get('ol li ul li').should('have.text', 'this is a bullet under 1').and('have.css', 'font-size', expectedSize);
                cy.get('p').last().should('have.text', 'This is more normal text.').and('have.css', 'font-size', expectedSize);
            });
        });
    });
});
