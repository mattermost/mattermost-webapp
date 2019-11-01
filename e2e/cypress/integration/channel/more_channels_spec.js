// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// import users from '../../fixtures/users.json';

describe('More channels modal', () => {
    before(() => {
        cy.loginAsNewUser().as('newuser');
    });

    it('MM-19337 Enable users to view archived channels', () => {
        let channel;

        // # Go to "/"
        cy.visit('/');

        cy.getCurrentTeamId().then((teamId) => {
            // # Create new test channel
            cy.apiCreateChannel(teamId, 'channel-test', 'Channel Test').then((res) => {
                channel = res.body;

                // * LHS should contain "More..." button
                cy.get('#sidebarChannelsMore').should('contain', 'More...');

                // # Select "More..." on the left hand side menu
                cy.get('#sidebarChannelsMore').click();

                // * Dropdown should be visible, defaulting to "Public Channels"
                cy.get('#ChannelsMoreDropdown').should('contain', 'Show: Public Channels');

                // * Channel test should be visible as a public channel in the list
                cy.get('#MoreChannelsList').should('contain', channel.display_name);

                // # Click outside of modal
                cy.get('#MoreChannelsModalHeader').get('button.close').click();

                // # Select channel on the left hand side
                cy.get(`#sidebarItem_${channel.name}`).click();

                // * Channel's display name should be visible at the top of the center pane
                cy.get('#channelHeaderTitle').should('contain', channel.display_name);

                // # Then click it to access the drop-down menu
                cy.get('#channelHeaderTitle').click();

                // # Archive the channel
                cy.get('#channelArchiveChannel').click();

                // # Wait for delete/archive channel modal
                cy.get('#deleteChannelModal').should('be.visible');

                // # Confirm archive
                cy.get('#deleteChannelModalDeleteButton').click();

                // # Select "More..." on the left hand side menu
                cy.get('#sidebarChannelsMore').click();

                // # Click on dropdown
                cy.get('#ChannelsMoreDropdown').click();

                // # Click on archived channels item
                cy.get('#ChannelsMoreDropdownArchived').click();

                // * Dropdown should now be set to show "Archived Channels"
                cy.get('#ChannelsMoreDropdown').should('contain', 'Show: Archived Channels');

                // * Channel test should be visible as an archived channel in the list
                cy.get('#MoreChannelsList').should('contain', channel.display_name);

                // # Click outside of modal
                cy.get('#MoreChannelsModalHeader').get('button.close').click();

                // # Select channel on the left hand side
                cy.get(`#sidebarItem_${channel.name}`).click();

                // * Assert that channel is archived and new messages can't be posted.
                cy.get('#channelArchivedMessage').should('contain', 'You are viewing an archived channel. New messages cannot be posted.');

                // # Join another channel
                cy.get('#sidebarItem_off-topic').click();

                // * Assert that archived channel doesn't show up in LHS list
                cy.get('#sidebarChannelContainer').should('not.contain', channel.display_name);
            });
        });
    });
});
