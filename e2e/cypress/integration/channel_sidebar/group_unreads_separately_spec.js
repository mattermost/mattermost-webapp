// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel_sidebar

import {getAdminAccount} from '../../support/env';

describe('Channel sidebar - group unreads separately', () => {
    let testTeam;
    let testChannel;

    beforeEach(() => {
        cy.apiAdminLogin().then(() => {
            cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
                testTeam = team;
                testChannel = channel;

                cy.visit(`/${team.name}/channels/town-square`);

                // # Toggle the unreads category setting
                enableOrDisableUnreadsCategory();

                // # Receive a message to the new channel
                cy.postMessageAs({sender: getAdminAccount(), message: 'test message', channelId: testChannel.id});
            });
        });
    });

    it('MM-T3719_1 Unreads category should show only if there is an unread message', () => {
        // * Verify UNREADS category is shown and that the channel is in there
        cy.get('.SidebarChannelGroup:contains(UNREADS)').should('be.visible').within(() => {
            cy.get('.SidebarChannelGroupHeader:contains(UNREADS)').should('be.visible');
            cy.get(`.SidebarChannel.unread:contains(${testChannel.display_name})`).should('be.visible');
        });

        // # Click on the unread channel
        cy.get(`.SidebarChannel.unread .SidebarLink:contains(${testChannel.display_name})`).should('be.visible').click();

        // * Verify we've switched to the new channel
        cy.url().should('include', `/${testTeam.name}/channels/${testChannel.name}`);

        // * Verify the channel is no longer unread but hasn't left the unreads category
        cy.get('.SidebarChannelGroup:contains(UNREADS)').should('be.visible').get(`.SidebarChannel:not(.unread):contains(${testChannel.display_name})`).should('be.visible');

        // # Switch to another channel
        cy.get('.SidebarLink:contains(Town Square)').should('be.visible').click();

        // * Verify unreads category has disappeared
        cy.get('.SidebarChannelGroupHeader:contains(UNREADS)').should('not.be.visible');

        // * Verify channel is in the CHANNELS category
        cy.get('.SidebarChannelGroup:contains(CHANNELS)').should('be.visible').get(`.SidebarChannel:contains(${testChannel.display_name})`).should('be.visible');
    });

    it('MM-T3719_2 Unreads category should disappear when the setting is turned off', () => {
        // * Verify UNREADS category is shown and that the channel is in there
        cy.get('.SidebarChannelGroup:contains(UNREADS)').should('be.visible').within(() => {
            cy.get('.SidebarChannelGroupHeader:contains(UNREADS)').should('be.visible');
            cy.get(`.SidebarChannel.unread:contains(${testChannel.display_name})`).should('be.visible');
        });

        // # Disable the unreads category
        enableOrDisableUnreadsCategory(false);

        // * Verify unreads category has disappeared
        cy.get('.SidebarChannelGroupHeader:contains(UNREADS)').should('not.be.visible');

        // * Verify that the channel is in the CHANNELS category
        cy.get('.SidebarChannelGroup:contains(CHANNELS)').should('be.visible').get(`.SidebarChannel.unread:contains(${testChannel.display_name})`).should('be.visible');
    });

    it('MM-T3719_3 Channels marked as unread should appear in the unreads category', () => {
        // # Click on the unread channel
        cy.get(`.SidebarChannel.unread .SidebarLink:contains(${testChannel.display_name})`).should('be.visible').click();

        // # Switch to another channel
        cy.get('.SidebarLink:contains(Town Square)').should('be.visible').click();

        // * Verify that the channel is currently in the CHANNELS category
        cy.get('.SidebarChannelGroup:contains(CHANNELS)').should('be.visible').get(`.SidebarChannel:not(.unread):contains(${testChannel.display_name})`).should('be.visible');

        // # Switch back to the test channel
        cy.get(`.SidebarChannel:not(.unread) .SidebarLink:contains(${testChannel.display_name})`).should('be.visible').click();

        // # Mark the last message as unread
        cy.getLastPostId().then((postId) => {
            cy.uiClickPostDropdownMenu(postId, 'Mark as Unread');
        });

        // * Verify that the channel appears in the UNREADS section
        cy.get('.SidebarChannelGroup:contains(UNREADS)').should('be.visible').get(`.SidebarChannel.unread:contains(${testChannel.display_name})`).should('be.visible');
    });

    it('MM-T3719_4 Read channels should not enter the unreads category', () => {
        // # Switch to a read channel
        cy.get('.SidebarLink:contains(Off-Topic)').should('be.visible').click();

        // * Verify channel is not in the UNREADS category
        cy.get('.SidebarChannelGroup:contains(CHANNELS)').should('be.visible').get('.SidebarChannel:not(.unread):contains(Off-Topic)').should('be.visible');
    });
});

function navigateToSidebarSettings() {
    cy.get('#channel_view').should('be.visible');
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#accountSettings').should('be.visible').click();
    cy.get('#accountSettingsModal').should('be.visible');

    cy.get('#sidebarButton').should('be.visible');
    cy.get('#sidebarButton').click();

    cy.get('#sidebarLi.active').should('be.visible');
    cy.get('#sidebarTitle > .tab-header').should('have.text', 'Sidebar Settings');
}

function toggleOnOrOffUnreadsCategory(toggleOn = true) {
    navigateToSidebarSettings();

    cy.get('#showUnreadsCategoryEdit').click();

    if (toggleOn) {
        cy.findByTestId('showUnreadsCategoryOn').click();
    } else {
        cy.findByTestId('showUnreadsCategoryOff').click();
    }
}

function enableOrDisableUnreadsCategory(enable = true) {
    toggleOnOrOffUnreadsCategory(enable);

    cy.get('#saveSetting').click();
    if (enable) {
        cy.get('#showUnreadsCategoryDesc').should('have.text', 'On');
    } else {
        cy.get('#showUnreadsCategoryDesc').should('have.text', 'Off');
    }
    cy.get('#accountSettingsHeader > .close').click();
}
