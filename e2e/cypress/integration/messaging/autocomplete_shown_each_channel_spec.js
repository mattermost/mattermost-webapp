// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe('Identical Message Drafts', () => {
    let testTeam;
    let testChannel;

    before(() => {
        // # Login as test user and visit test channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;

            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        });
    });

    it('MM-T132 Identical Message Drafts - Autocomplete shown in each channel', () => {
        // # Go to test Channel A on sidebar
        cy.get('#sidebarItem_town-square').should('be.visible').click();

        // * Validate if the channel has been opened
        cy.url().should('include', '/channels/town-square');

        // # Start a draft in Channel A containing just "@"
        cy.get('#post_textbox').should('be.visible').type('@');

        // * At mention auto-complete appears in Channel A
        cy.get('#suggestionList').should('be.visible');

        // # Go to test Channel B on sidebar
        cy.get(`#sidebarItem_${testChannel.name}`).should('be.visible').click();

        // * Validate if the newly navigated channel is open
        // * autocomplete should not be visible in channel
        cy.url().should('include', `/channels/${testChannel.name}`);
        cy.get('#suggestionList').should('not.be.visible');

        // # Start a draft in Channel B containing just "@"
        cy.get('#post_textbox').should('be.visible').type('@');

        // * At mention auto-complete appears in Channel B
        cy.get('#suggestionList').should('be.visible');

        // # Go to Channel C then back to test Channel A on sidebar
        cy.get('#sidebarItem_off-topic').should('be.visible').click();
        cy.get('#sidebarItem_town-square').should('be.visible').click();

        // * Validate if the channel has been opened
        // * At mention auto-complete is preserved in Channel A
        cy.url().should('include', '/channels/town-square');
        cy.get('#post_textbox').should('be.visible');
        cy.get('#suggestionList').should('be.visible');
    });
});

