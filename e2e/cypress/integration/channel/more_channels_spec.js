// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

let channel;

describe('Channels', () => {
    before(() => {
        cy.apiUpdateConfig({
            TeamSettings: {
                ExperimentalViewArchivedChannels: true,
            },
        });

        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
        cy.getCurrentTeamId().then((teamId) => {
            // # Create new test channel
            cy.apiCreateChannel(teamId, 'channel-test', 'Channel Test' + Date.now()).then((res) => {
                channel = res.body;
            });
        });
    });

    it('MM-19337 Verify UI of More channels modal with archived selection', () => {
        verifyMoreChannelsModalWithArchivedSelection(false);

        verifyMoreChannelsModalWithArchivedSelection(true);
    });

    it('MM-19337 Enable users to view archived channels', () => {
        // # Login as new user and go to "/"
        cy.getCurrentTeamId().then((teamId) => {
            cy.loginAsNewUser({}, [teamId]);
            cy.visit('/ad-1/channels/town-square');
        });

        // # Go to LHS and click "More..." under Public Channels group
        cy.get('#publicChannelList').should('be.visible').within(() => {
            cy.findByText('More...').scrollIntoView().should('be.visible').click();
        });

        cy.get('#moreChannelsModal').should('be.visible').within(() => {
            // * Dropdown should be visible, defaulting to "Public Channels"
            cy.get('#channelsMoreDropdown').should('be.visible').and('contain', 'Show: Public Channels');

            cy.get('#searchChannelsTextbox').type(channel.display_name).wait(TIMEOUTS.TINY);
            cy.get('#moreChannelsList').children().should('have.length', 1).within(() => {
                cy.findByText(channel.display_name).should('be.visible');
            });
            cy.get('#searchChannelsTextbox').clear();

            // * Channel test should be visible as a public channel in the list
            cy.get('#moreChannelsList').should('be.visible').within(() => {
                // # Click to join the channel
                cy.findByText(channel.display_name).scrollIntoView().should('be.visible').click();
            });
        });

        // # Verify that the modal is closed and it's redirected to the selected channel
        cy.get('#moreChannelsModal').should('not.exist');
        cy.url().should('include', `/ad-1/channels/${channel.name}`);

        // # Login as channel admin and go directly to the channel
        cy.apiLogin('user-1');
        cy.visit(`/ad-1/channels/${channel.name}`);

        // # Click channel header to open channel menu
        cy.get('#channelHeaderTitle').should('contain', channel.display_name).click();

        // * Verify that the menu is opened
        cy.get('.Menu__content').should('be.visible').within(() => {
            // # Archive the channel
            cy.findByText('Archive Channel').should('be.visible').click();
        });

        // * Verify that the delete/archive channel modal is opened
        cy.get('#deleteChannelModal').should('be.visible').within(() => {
            // # Confirm archive
            cy.findByText('Archive').should('be.visible').click();
        });

        // # Go to LHS and click "More..." under Public Channels group
        cy.get('#publicChannelList').should('be.visible').within(() => {
            cy.findByText('More...').scrollIntoView().should('be.visible').click();
        });

        cy.get('#moreChannelsModal').should('be.visible').within(() => {
            // # CLick dropdown to open selection
            cy.get('#channelsMoreDropdown').should('be.visible').click().within((el) => {
                // # Click on archived channels item
                cy.findByText('Archived Channels').should('be.visible').click();

                // * Channel test should be visible as an archived channel in the list
                cy.wrap(el).should('contain', 'Show: Archived Channels');
            });

            cy.get('#searchChannelsTextbox').type(channel.display_name).wait(TIMEOUTS.TINY);
            cy.get('#moreChannelsList').children().should('have.length', 1).within(() => {
                cy.findByText(channel.display_name).should('be.visible');
            });
            cy.get('#searchChannelsTextbox').clear();

            // * Test channel should be visible as a archived channel in the list
            cy.get('#moreChannelsList').should('be.visible').within(() => {
                // # Click to view archived channel
                cy.findByText(channel.display_name).scrollIntoView().should('be.visible').click();
            });
        });

        // * Assert that channel is archived and new messages can't be posted.
        cy.get('#channelArchivedMessage').should('contain', 'You are viewing an archived channel. New messages cannot be posted.');
        cy.get('#post_textbox').should('not.exist');

        // # Switch to another channel
        cy.get('#sidebarItem_town-square').click();

        // * Assert that archived channel doesn't show up in LHS list
        cy.get('#publicChannelList').should('not.contain', channel.display_name);
    });
});

function verifyMoreChannelsModalWithArchivedSelection(isEnabled) {
    // # Update config to enable/disable viewing of archived channels
    cy.apiUpdateConfig({
        TeamSettings: {
            ExperimentalViewArchivedChannels: isEnabled,
        },
    });

    // # Login as sysadmin and verify more channels modal
    cy.apiLogin('sysadmin');
    verifyMoreChannelsModal(isEnabled);

    // # Login as regular user and verify more channels modal
    cy.apiLogin('user-1');
    verifyMoreChannelsModal(isEnabled);
}

function verifyMoreChannelsModal(isEnabled) {
    cy.visit('/');

    // # Select "More..." on the left hand side menu
    cy.get('#publicChannelList').should('be.visible').within(() => {
        cy.findByText('More...').scrollIntoView().should('be.visible').click({force: true});
    });

    // * Verify that the more channels modal is open and with or without option to view archived channels
    cy.get('#moreChannelsModal').should('be.visible').within(() => {
        if (isEnabled) {
            cy.get('#channelsMoreDropdown').should('be.visible').and('have.text', 'Show: Public Channels');
        } else {
            cy.get('#channelsMoreDropdown').should('not.exist');
        }
    });
}
