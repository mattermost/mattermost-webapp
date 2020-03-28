// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Channels', () => {
    let testChannel;
    let isArchived;

    beforeEach(() => {
        testChannel = null;
        isArchived = false;

        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // # Create new channel
        cy.apiGetTeamByName('ad-1').then((teamRes) => {
            // # Create new test channel
            cy.apiCreateChannel(teamRes.body.id, 'a-channel-test', 'A Channel Test').then((channelRes) => {
                testChannel = channelRes.body;
            });
        });

        // # Visit the Town Square channel
        cy.visit('/ad-1/channels/town-square');
    });

    afterEach(() => {
        cy.apiLogin('sysadmin');
        if (testChannel && testChannel.id && !isArchived) {
            cy.apiDeleteChannel(testChannel.id);
        }
    });

    it('MM-19337 Verify UI of More channels modal with archived selection', () => {
        verifyMoreChannelsModalWithArchivedSelection(false);
        verifyMoreChannelsModalWithArchivedSelection(true);
    });

    it('MM-19337 Enable users to view archived channels', () => {
        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // # Enable Experimental ViewArchived Channels
        cy.apiUpdateConfig({
            TeamSettings: {
                ExperimentalViewArchivedChannels: true,
            },
        });

        // # Login as new user and go to "/"
        cy.apiGetTeamByName('ad-1').then((res) => {
            cy.apiCreateAndLoginAsNewUser({}, [res.body.id]);
            cy.visit('/ad-1/channels/town-square');
        });

        // # Go to LHS and click "More..." under Public Channels group
        cy.get('#publicChannelList', {timeout: TIMEOUTS.LARGE}).should('be.visible').within(() => {
            cy.findByText('More...').scrollIntoView().should('be.visible').click();
        });

        cy.get('#moreChannelsModal').should('be.visible').within(() => {
            // * Dropdown should be visible, defaulting to "Public Channels"
            cy.get('#channelsMoreDropdown').should('be.visible').and('contain', 'Show: Public Channels');

            cy.get('#searchChannelsTextbox').type(testChannel.display_name).wait(TIMEOUTS.TINY);
            cy.get('#moreChannelsList').children().should('have.length', 1).within(() => {
                cy.findByText(testChannel.display_name).scrollIntoView().should('be.visible');
            });
            cy.get('#searchChannelsTextbox').clear();

            // * Channel test should be visible as a public channel in the list
            cy.get('#moreChannelsList').should('be.visible').within(() => {
                // # Click to join the channel
                cy.findByText(testChannel.display_name).scrollIntoView().should('be.visible').click();
            });
        });

        // # Verify that the modal is closed and it's redirected to the selected channel
        cy.get('#moreChannelsModal').should('not.exist');
        cy.url().should('include', `/ad-1/channels/${testChannel.name}`);

        // # Login as channel admin and go directly to the channel
        cy.apiLogin('user-1');
        cy.visit(`/ad-1/channels/${testChannel.name}`);

        // # Click channel header to open channel menu
        cy.get('#channelHeaderTitle').should('contain', testChannel.display_name).click();

        // * Verify that the menu is opened
        cy.get('.Menu__content').should('be.visible').within(() => {
            // # Archive the channel
            cy.findByText('Archive Channel').should('be.visible').click();
        });

        // * Verify that the delete/archive channel modal is opened
        cy.get('#deleteChannelModal').should('be.visible').within(() => {
            // # Confirm archive
            cy.findByText('Archive').should('be.visible').click();
            isArchived = true;
        });

        // # Go to LHS and click "More..." under Public Channels group
        cy.reload();
        cy.get('#publicChannelList', {timeout: TIMEOUTS.LARGE}).should('be.visible').within(() => {
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

            cy.get('#searchChannelsTextbox').type(testChannel.display_name).wait(TIMEOUTS.TINY);
            cy.get('#moreChannelsList').children().should('have.length', 1).within(() => {
                cy.findByText(testChannel.display_name).scrollIntoView().should('be.visible');
            });
            cy.get('#searchChannelsTextbox').clear();

            // * Test channel should be visible as a archived channel in the list
            cy.get('#moreChannelsList').should('be.visible').within(() => {
                // # Click to view archived channel
                cy.findByText(testChannel.display_name).scrollIntoView().should('be.visible').click();
            });
        });

        // * Assert that channel is archived and new messages can't be posted.
        cy.get('#channelArchivedMessage').should('contain', 'You are viewing an archived channel. New messages cannot be posted.');
        cy.get('#post_textbox').should('not.exist');

        // # Switch to another channel
        cy.get('#sidebarItem_town-square').click();

        // * Assert that archived channel doesn't show up in LHS list
        cy.get('#publicChannelList', {timeout: TIMEOUTS.LARGE}).should('not.contain', testChannel.display_name);
    });
});

function verifyMoreChannelsModalWithArchivedSelection(isEnabled) {
    // # Login as sysadmin
    cy.apiLogin('sysadmin');

    // # Update Experimental View Archived Channels
    cy.apiUpdateConfig({
        TeamSettings: {
            ExperimentalViewArchivedChannels: isEnabled,
        },
    });

    // * Verify more channels modal
    verifyMoreChannelsModal(isEnabled);

    // # Login as regular user and verify more channels modal
    cy.apiLogin('user-1');
    verifyMoreChannelsModal(isEnabled);
}

function verifyMoreChannelsModal(isEnabled) {
    cy.visit('/ad-1/channels/town-square');

    // # Select "More..." on the left hand side menu
    cy.get('#publicChannelList', {timeout: TIMEOUTS.LARGE}).should('be.visible').within(() => {
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
