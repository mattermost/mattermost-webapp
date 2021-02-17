// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

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
        const testChannel = 'Off-Topic';
        const message = 'message draft test';

        // * Validate if the draft icon is not visible at LHS before making a draft
        verifyDraftIcon(testChannel, false);

        // # Go to test channel and check if it opened correctly
        openChannelFromLhs(testTeam.name, testChannel);

        // # Type a message in the input box but do not send
        cy.findByRole('textbox', `write to ${testChannel.toLowerCase()}`).should('be.visible').type(message);

        // # Switch to another channel and check if it opened correctly
        openChannelFromLhs(testTeam.name, 'Town Square', 'town-square');

        // * Validate if the draft icon is visible at LHS
        verifyDraftIcon(testChannel, true);

        // # Press CTRL/CMD+K shortcut to open Quick Channel Switch modal
        cy.typeCmdOrCtrl().type('K', {release: true});

        // * Verify that the switch model is shown
        cy.findAllByRole('dialog').first().findByText('Switch Channels').should('be.visible');

        // # Type the first few letters of the channel name you typed the message draft in
        cy.findByRole('textbox', {name: 'quick switch input'}).type(testChannel.substring(0, 3));

        // * Suggestion list is visible
        cy.get('#suggestionList').should('be.visible').within(() => {
            // * A pencil icon before the channel name in the filtered list is visible
            cy.findByLabelText(testChannel).find('.icon-pencil-outline').should('be.visible');

            // # Click to switch back to the test channel
            cy.findByLabelText(testChannel).click();
        });

        // * Draft is saved in the text input box of the test channel
        cy.findByRole('textbox', `write to ${testChannel.toLowerCase()}`).should('be.visible').and('have.text', message);
    });
});

function verifyDraftIcon(channelName, isVisible) {
    cy.uiGetLhsSection('CHANNELS').findByLabelText(`${channelName.toLowerCase()} public channel`).
        should('be.visible').
        findByTestId('draftIcon').
        should(isVisible ? 'be.visible' : 'not.exist');
}

function openChannelFromLhs(teamName, displayName, name) {
    // # Go to test channel and check if it opened correctly
    cy.uiGetLhsSection('CHANNELS').findByText(displayName).click();
    cy.url().should('include', `/${teamName}/channels/${name || displayName.toLowerCase()}`);
}

