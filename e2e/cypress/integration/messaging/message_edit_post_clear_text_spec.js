// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Delete the post on text clear', () => {
    let townsquareLink;

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            townsquareLink = `/${team.name}/channels/town-square`;
            cy.visit(townsquareLink);
        });
    });

    it('MM-T2146 Remove all text from a post (no attachment)', () => {
        // # Go to a test channel on the side bar
        cy.get('#sidebarItem_town-square').click({force: true});

        // * Validate if the channel has been opened
        cy.url().should('include', townsquareLink);

        // # Type 'This is sample text' and submit
        cy.postMessage('This is sample text');

        // # Get last post ID
        cy.getLastPostId().then((postID) => {
            // # click  dot menu button
            cy.clickPostDotMenu();

            // # click edit post
            cy.get(`#edit_post_${postID}`).click();

            // # Edit message to 'This is sample add text'
            cy.get('#edit_textbox').should('be.visible').and('be.focused').wait(TIMEOUTS.HALF_SEC).clear();

            // # Click button Edit
            cy.get('#editButton').click();

            // # Press Enter to confirm
            cy.focused().click(); // pressing Enter on buttons is not supported in Cypress, so we use click instead

            // * Assert post message disappears
            cy.get(`#postMessageText_${postID}`).should('not.exist');
        });
    });
});
