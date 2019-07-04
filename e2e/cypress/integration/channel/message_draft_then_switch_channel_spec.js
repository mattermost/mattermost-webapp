// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

let testTeam;

describe('Message Draft and Switch Channels', () => {
    before(() => {
        // # Login as new user
        cy.loginAsNewUser().then(() => {
            // # Create new team and visit its URL
            cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
                testTeam = response.body;
                cy.visit(`/${testTeam.name}`);
            });
        });
    });

    it('M14358 Message Draft Pencil Icon Visible in Channel Switcher', () => {
        // # In a test channel, type some text in the message input box
        // # Do not send the post
        cy.get('#sidebarItem_town-square').click({force: true});

        // * Validate if the channel has been opened
        cy.url().should('include', `/${testTeam.name}/channels/town-square`);

        // * Validate if the draft icon is not visible on the sidebar before making a draft
        cy.get('#publicChannel').scrollIntoView();
        cy.get('#sidebarItem_town-square #draftIcon').should('be.not.visible');

        // Type in some text into the text area of the opened channel
        cy.get('#post_textbox').type('message draft test');

        // # Switch to another channel
        cy.get('#sidebarItem_off-topic').click({force: true});

        // * Validate if the newly navigated channel is open
        cy.url().should('include', `/${testTeam.name}/channels/off-topic`);

        // # Press CTRL/CMD+K
        cy.typeCmdOrCtrl().type('K', {release: true});

        // * Click on hint in modal to get out of overlapping suggestion list
        cy.get('#quickSwitchHint').click();

        // # Type the first few letters of the channel name you typed the message draft in
        cy.get('#quickSwitchInput').type('tow');
        cy.wait(TIMEOUTS.TINY);

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        // * Validate if the draft icon is visible to left of the channel name in the filtered list
        cy.get('#publicChannel').scrollIntoView();
        cy.get('#switchChannel_town-square #draftIcon').should('be.visible');

        // * Escape channel switcher and reset post textbox for test channel
        cy.get('.close').click();
        cy.clearPostTextbox('town-square');
    });
});

