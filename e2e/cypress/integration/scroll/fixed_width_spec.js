// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @scroll

describe('Scroll', () => {
    let testTeam;
    let testChannel;
    let otherUser;

    beforeEach(() => {
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;

            cy.apiCreateUser().then(({user: user2}) => {
                otherUser = user2;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });

            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
        });
    });

    it('MM-T2368 Fixed Width setting should not scroll pop and display posts properly', () => {
        // Creating some post to verify scroll pop and Posts views
        cy.postMessage('This is the first post');
        Cypress._.times(18, (postIndex) => {
            cy.postMessage(`p-${postIndex + 1}`);
        });
        cy.postMessage('This is the last post');

        // # Switch the account settings for the test user to enable Fixed width center
        cy.get('#headerInfo > .style--none').click();
        cy.get('#accountSettings > .style--none > .MenuItem__primary-text').click();
        cy.get('#accountSettingsModalLabel > span').should('contain', 'Account Settings');
        cy.get('#displayButton', {timeout: 500000}).click();
        cy.get('#channel_display_modeEdit > span').click();
        cy.get('#settingTitle > span').should('contain', 'Channel Display');
        cy.get('input#channel_display_modeFormatB').click();
        cy.get('input#channel_display_modeFormatB').next().should('contain', 'Fixed width, centered');
        cy.get('#saveSetting').click();
        cy.get('#accountSettingsHeader > .close > [aria-hidden="true"]').click();

        // # Browse to Channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // * Verify there is no scroll pop
        cy.get('button[aria-label="sysadmin"]').eq(0).should('be.visible');
        cy.get('#post-list').should('exist').within(() => {
            cy.findByText('This is the first post').should('exist').and('be.visible');
            cy.findByText('This is the last post').should('exist').and('be.visible');
        });

        // * Verify All posts are displayed correctly
        Cypress._.times(18, (postIndex) => {
            cy.get('#post-list').should('exist').within(() => {
                cy.findByText(`p-${postIndex + 1}`).should('exist').and('be.visible');
            });
        });
    });
});
