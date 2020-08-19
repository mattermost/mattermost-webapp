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

describe('Message Draft and Switch Channels', () => {
    let testTeam;

    before(() => {
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T131 Message Draft Pencil Icon - CTRL/CMD+K & "Jump to"', () => {
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
        cy.wait(TIMEOUTS.HALF_SEC);

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        // * Validate if the draft icon is visible to left of the channel name in the filtered list
        cy.get('#publicChannel').scrollIntoView();
        cy.get('#switchChannel_town-square .icon-pencil-outline').should('be.visible');

        // * Escape channel switcher and reset post textbox for test channel
        cy.get('.close').click();
        cy.clearPostTextbox('town-square');
    });
});

