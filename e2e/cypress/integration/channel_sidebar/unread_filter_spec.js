// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel_sidebar

import {
    beMuted,
    beRead,
    beUnread,
} from '../../support/assertions';
import {getAdminAccount} from '../../support/env';

import {getRandomId} from '../../utils';

describe('Channel sidebar unread filter', () => {
    let testUser;

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelSidebarOrganization: 'default_on',
            },
        });

        cy.apiInitSetup({loginAfter: true}).then(({user}) => {
            testUser = user;

            cy.visit('/');
        });
    });

    it('MM-T3441 should change the filter label when the unread filter changes state', () => {
        // * Verify that the unread filter is in all channels state
        cy.get('.SidebarFilters:contains(VIEWING:)').should('be.visible');
        cy.get('.SidebarFilters:contains(All channels)').should('be.visible');

        enableUnreadFilter();

        // * Verify that the unread filter is in filter by unread state
        cy.get('.SidebarFilters:contains(FILTERED BY:)').should('be.visible');
        cy.get('.SidebarFilters:contains(Unread)').should('be.visible');

        disableUnreadFilter();

        // * Verify that the unread filter is back in all channels state
        cy.get('.SidebarFilters:contains(VIEWING:)').should('be.visible');
        cy.get('.SidebarFilters:contains(All channels)').should('be.visible');
    });

    it('MM-T3442 should not persist the state of the unread filter on reload', () => {
        // * Verify that all categories are visible
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS)').should('be.visible');
        cy.get('.SidebarChannelGroupHeader:contains(DIRECT MESSAGES)').should('be.visible');

        enableUnreadFilter();

        // # Reload the page
        cy.reload();

        // * Verify that all categories are visible again
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS)').should('be.visible');
        cy.get('.SidebarChannelGroupHeader:contains(DIRECT MESSAGES)').should('be.visible');
    });

    it('MM-T3443 should only show unread channels with filter enabled', () => {
        // * Verify that the unread filter is not enabled
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS)').should('be.visible');

        // # Create a couple of new channels, one of which is unread and one of which is not
        const readChannelName = `read${getRandomId()}`;
        const unreadChannelName = `unread${getRandomId()}`;
        cy.getCurrentTeamId().then((teamId) => {
            createChannel(teamId, readChannelName);
            createChannel(teamId, unreadChannelName, 'test');
        });

        // * Verify that the channels are correctly read and unread
        cy.get(`#sidebarItem_${readChannelName}`).should(beRead);
        cy.get(`#sidebarItem_${unreadChannelName}`).should(beUnread);

        enableUnreadFilter();

        // * Verify that the read channel has been hidden
        cy.get(`#sidebarItem_${readChannelName}`).should('not.exist');

        // * Verify that the unread channel is still visible
        cy.get(`#sidebarItem_${unreadChannelName}`).should('be.visible').should(beUnread);

        disableUnreadFilter();

        // * Verify that the read channel has reappeared
        cy.get(`#sidebarItem_${readChannelName}`).should('be.visible').should(beRead);
    });

    it('MM-T3444 should always show the current channel, even if it is not unread', () => {
        // * Verify that the unread filter is not enabled
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS)').should('be.visible');

        // # Switch to the town square
        cy.get('#sidebarItem_town-square').click();
        cy.get('#channelHeaderTitle').should('contain', 'Town Square');

        // * Verify that the Town Square is not unread
        cy.get('#sidebarItem_town-square').should('be.visible').should(beRead);

        enableUnreadFilter();

        // * Verify that the Town Square is still visible
        cy.get('#sidebarItem_town-square').should('be.visible').should(beRead);

        disableUnreadFilter();
    });

    it('MM-T3445 should hide channels once they have been read', () => {
        // * Verify that the unread filter is not enabled
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS)').should('be.visible');

        // # Create a couple of new channels, both of which are unread
        const channelName1 = `channel${getRandomId()}`;
        const channelName2 = `channel${getRandomId()}`;
        cy.getCurrentTeamId().then((teamId) => {
            createChannel(teamId, channelName1, 'test');
            createChannel(teamId, channelName2, 'test');
        });

        enableUnreadFilter();

        // * Verify that both channels are visible
        cy.get(`#sidebarItem_${channelName1}`).should('be.visible').should(beUnread);
        cy.get(`#sidebarItem_${channelName2}`).should('be.visible').should(beUnread);

        // # Visit the first channel
        cy.get(`#sidebarItem_${channelName1}`).click();

        // * Verify that both channels are still visible
        cy.get(`#sidebarItem_${channelName1}`).should('be.visible').should(beRead);
        cy.get(`#sidebarItem_${channelName2}`).should('be.visible').should(beUnread);

        // # Visit the second channel
        cy.get(`#sidebarItem_${channelName2}`).click();

        // * Verify that the first channel has disappeared
        cy.get(`#sidebarItem_${channelName1}`).should('not.exist');
        cy.get(`#sidebarItem_${channelName2}`).should('be.visible').should(beRead);

        disableUnreadFilter();
    });

    it('MM-T3446 should only show unread channels with filter enabled', () => {
        // * Verify that the unread filter is not enabled
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS)').should('be.visible');

        // # Create a couple of new channels
        const mentionedChannelName = `mentioned${getRandomId()}`;
        const unreadChannelName = `muted${getRandomId()}`;
        cy.getCurrentTeamId().then((teamId) => {
            createChannel(teamId, mentionedChannelName, `@${testUser.username}`);
            createChannel(teamId, unreadChannelName, 'test');
        });

        // # Open the channel menu and mute both of them
        cy.get(`#sidebarItem_${mentionedChannelName} .SidebarMenu_menuButton`).click({force: true});
        cy.get('.SidebarMenu').contains('.MenuItem', 'Mute Channel').click();

        cy.get(`#sidebarItem_${unreadChannelName} .SidebarMenu_menuButton`).click({force: true});
        cy.get('.SidebarMenu').contains('.MenuItem', 'Mute Channel').click();

        // * Verify that the first channel has a mention and is muted
        cy.get(`#sidebarItem_${mentionedChannelName}`).should(beUnread).should(beMuted);
        cy.get(`#sidebarItem_${mentionedChannelName} .badge`).should('be.visible');

        // * Verify that the second channel does not have a mention and is muted
        cy.get(`#sidebarItem_${unreadChannelName}`).should(beRead).should(beMuted);
        cy.get(`#sidebarItem_${unreadChannelName} .badge`).should('not.exist');

        enableUnreadFilter();

        // * Verify that the muted channel with a mention is still visible
        cy.get(`#sidebarItem_${mentionedChannelName}`).should('be.visible');

        // * Verify that the muted channel without a mention has been hidden
        cy.get(`#sidebarItem_${unreadChannelName}`).should('not.exist');

        disableUnreadFilter();

        // * Verify that the muted channel without a mention has reappeared
        cy.get(`#sidebarItem_${unreadChannelName}`).should('be.visible');
    });
});

function enableUnreadFilter() {
    // # Enable the unread filter
    cy.get('.SidebarFilters_filterButton').click();

    // * Verify that the unread filter is enabled
    cy.get('.SidebarChannelGroupHeader:contains(ALL UNREADS)').should('be.visible');
}

function disableUnreadFilter() {
    // # Enable the unread filter
    cy.get('.SidebarFilters_filterButton').click();

    // * Verify that the unread filter is disabled
    cy.get('.SidebarChannelGroupHeader:contains(ALL UNREADS)').should('not.exist');
}

function createChannel(teamId, channelName, message) {
    cy.apiCreateChannel(teamId, channelName, channelName, 'O', '', '', false).then(({channel}) => {
        if (message) {
            cy.postMessageAs({sender: getAdminAccount(), message, channelId: channel.id});
        }
    });
}
