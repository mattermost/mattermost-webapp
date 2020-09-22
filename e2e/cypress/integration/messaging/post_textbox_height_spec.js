// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe('Messaging', () => {
    before(() => {
        // # Login as test user and visit town-square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // # Add two posts
            cy.postMessage('test post 1');
            cy.postMessage('test post 2');
        });
    });

    it('MM-T212 Leave a long draft in reply input box', () => {
        // # Get latest post id
        cy.getLastPostId().then((latestPostId) => {
            // # Click reply icon
            cy.clickPostCommentIcon(latestPostId);

            // # Make sure that text box has initial height
            getTextBox().should('have.css', 'height', '100px').invoke('height').as('originalHeight1');

            // # Write a long text in text box
            getTextBox().type('test{shift}{enter}{enter}{enter}{enter}{enter}{enter}{enter}test');

            // # Check that input box is taller than before
            cy.get('@originalHeight1').then((originalHeight1) => {
                getTextBox().invoke('height').should('be.gt', originalHeight1 * 2);
            });

            // # Get second latest post id
            const secondLatestPostIndex = -2;
            cy.getNthPostId(secondLatestPostIndex).then((secondLatestPostId) => {
                // # Click reply icon on the second latest post
                cy.clickPostCommentIcon(secondLatestPostId);

                // # Make sure that text box has initial height
                getTextBox().should('have.css', 'height', '100px').invoke('height').as('originalHeight2');

                // # Click again reply icon on the latest post
                cy.clickPostCommentIcon(latestPostId);

                // # Check that input box is taller again
                cy.get('@originalHeight2').then((originalHeight2) => {
                    getTextBox().invoke('height').should('be.gt', originalHeight2 * 2);
                });
            });
        });
    });

    const getTextBox = () => {
        return cy.get('#reply_textbox');
    };
});
