// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('MM-13697 Edit Post with attachment', () => {
    let townsquareLink;

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            townsquareLink = `/${team.name}/channels/town-square`;
            cy.visit(townsquareLink);
        });
    });

    it('Pasted text should be pasted where the cursor is', () => {
        // # Got to a test channel on the side bar
        cy.get('#sidebarItem_town-square').click({force: true});

        // * Validate if the channel has been opened
        cy.url().should('include', townsquareLink);

        // # Upload a file on center view
        cy.get('#fileUploadInput').attachFile('mattermost-icon.png');

        // # Type 'This is sample text' and submit
        cy.postMessage('This is sample text');

        // # Get last post ID
        cy.getLastPostId().then((postID) => {
            // # click  dot menu button
            cy.clickPostDotMenu();

            // # click edit post
            cy.get(`#edit_post_${postID}`).click();

            // # Edit message to 'This is sample add text'
            cy.get('#edit_textbox').
                should('be.visible').
                and('be.focused').
                wait(TIMEOUTS.HALF_SEC).
                type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}').type('add ');

            // # Click button Edit
            cy.get('#editButton').click();

            // * Assert post message should contain 'This is sample add text'
            cy.get(`#postMessageText_${postID}`).should('have.text', 'This is sample add text');

            cy.get(`#${postID}_message`).within(() => {
                // * Assert file attachment should still exist
                cy.get('.file-view--single').should('be.visible');
            });
        });
    });
});
