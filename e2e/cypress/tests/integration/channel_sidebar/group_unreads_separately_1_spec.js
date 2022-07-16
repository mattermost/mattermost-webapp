// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel_sidebar

import {getAdminAccount} from '../../support/env';

describe('Channel sidebar - group unreads separately', () => {
    let testChannel;

    beforeEach(() => {
        cy.apiAdminLogin().then(() => {
            cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
                testChannel = channel;

                cy.visit(`/${team.name}/channels/town-square`);

                // # Toggle the unreads category setting
                enableOrDisableUnreadsCategory();

                // # Receive a message to the new channel
                cy.postMessageAs({sender: getAdminAccount(), message: 'test message', channelId: testChannel.id});
            });
        });
    });

    it('MM-T3719_3 Channels marked as unread should appear in the unreads category -- KNOWN ISSUE: MM-42636', () => {
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

    it('MM-T4655 Leaving an unread channel when unread category is ON -- KNOWN ISSUE: MM-42636', () => {
        // # Click on the unread channel
        cy.get(`.SidebarChannel.unread .SidebarLink:contains(${testChannel.display_name})`).should('be.visible').click();

        // # Mark the last message as unread
        cy.getLastPostId().then((postId) => {
            cy.uiClickPostDropdownMenu(postId, 'Mark as Unread');
        });

        // * Verify that the channel appears in the UNREADS section
        cy.get('.SidebarChannelGroup:contains(UNREADS)').should('be.visible').get(`.SidebarChannel.unread:contains(${testChannel.display_name})`).should('be.visible');

        // # Leave the channel
        cy.uiLeaveChannel();

        // * User should be redirect to Town Square
        cy.url().should('include', '/channels/town-square');
    });
});

function toggleOnOrOffUnreadsCategory(toggleOn = true) {
    // # Go to Sidebar Settings
    cy.uiOpenSettingsModal('Sidebar');

    cy.get('#showUnreadsCategoryEdit').click();

    if (toggleOn) {
        cy.findByTestId('showUnreadsCategoryOn').click();
    } else {
        cy.findByTestId('showUnreadsCategoryOff').click();
    }
}

function enableOrDisableUnreadsCategory(enable = true) {
    toggleOnOrOffUnreadsCategory(enable);

    cy.uiSave();
    if (enable) {
        cy.get('#showUnreadsCategoryDesc').should('have.text', 'On');
    } else {
        cy.get('#showUnreadsCategoryDesc').should('have.text', 'Off');
    }

    cy.uiClose();
}
