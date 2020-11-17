// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel_sidebar

import {
    beMuted,
    beRead,
    beUnmuted,
    beUnread,
} from '../../support/assertions';
import {getAdminAccount} from '../../support/env';

import {getRandomId, stubClipboard} from '../../utils';

describe('Sidebar channel menu', () => {
    const sysadmin = getAdminAccount();

    let teamName;

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelSidebarOrganization: 'default_on',
            },
        });

        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            teamName = team.name;

            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T3349_1 should be able to mark a channel as read', () => {
        // # Start in Town Square
        cy.get('#sidebarItem_town-square').click();
        cy.get('#channelHeaderTitle').should('contain', 'Town Square');

        // # Save the ID of the Town Square channel for later
        cy.getCurrentChannelId().as('townSquareId');

        // # Switch to the Off Topic channel
        cy.get('#sidebarItem_off-topic').click();
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');

        // # Have another user send a message in the Town Square
        cy.get('@townSquareId').then((channelId) => {
            cy.postMessageAs({
                sender: sysadmin,
                message: 'post1',
                channelId,
            });
        });

        // * Verify that the Town Square channel is now unread
        cy.get('#sidebarItem_town-square').should(beUnread);

        // # Open the channel menu and select the Mark as Read option
        cy.get('#sidebarItem_town-square').find('.SidebarMenu_menuButton').click({force: true});
        cy.get('.SidebarMenu').contains('.MenuItem', 'Mark as Read').click();

        // * Verify that the Town Square channel is now read
        cy.get('#sidebarItem_town-square').should(beRead);
    });

    it('MM-T3349_2 should be able to favorite/unfavorite a channel', () => {
        // * Verify that the channel starts in the CHANNELS category
        cy.contains('.SidebarChannelGroup', 'CHANNELS').as('channelsCategory');
        cy.get('@channelsCategory').find('#sidebarItem_town-square');

        // # Open the channel menu and select the Favorite option
        cy.get('#sidebarItem_town-square').find('.SidebarMenu_menuButton').click({force: true});
        cy.get('.SidebarMenu').contains('.MenuItem', 'Favorite').click();

        // * Verify that the channel has moved to the FAVORITES category
        cy.contains('.SidebarChannelGroup', 'FAVORITES').find('#sidebarItem_town-square');

        // # Open the channel menu and select the Unfavorite option
        cy.get('#sidebarItem_town-square').find('.SidebarMenu_menuButton').click({force: true});
        cy.get('.SidebarMenu').contains('.MenuItem', 'Unfavorite').click();

        // * Verify that the channel has moved back to the CHANNELS category
        cy.get('@channelsCategory').find('#sidebarItem_town-square');
    });

    it('MM-T3349_3 should be able to mute/unmute a channel', () => {
        // * Verify that the channel starts unmuted
        cy.get('#sidebarItem_town-square').should(beUnmuted);

        // # Open the channel menu and select the Mute Channel option
        cy.get('#sidebarItem_town-square .SidebarMenu_menuButton').click({force: true});
        cy.get('.SidebarMenu').contains('.MenuItem', 'Mute Channel').click();

        // * Verify that the channel is now muted
        cy.get('#sidebarItem_town-square').should(beMuted);

        // # Open the channel menu and select the Unmute Channel option
        cy.get('#sidebarItem_town-square .SidebarMenu').click({force: true});
        cy.get('#sidebarItem_town-square .SidebarMenu').should('be.visible').contains('.MenuItem', 'Unmute Channel').click();

        // // * Verify that the channel is no longer muted
        cy.get('#sidebarItem_town-square').should(beUnmuted);
    });

    it('MM-T3349_4 should be able to move channels between categories', () => {
        const categoryName = `new-${getRandomId()}`;

        // * Verify that the channel starts in the CHANNELS category
        cy.contains('.SidebarChannelGroup', 'CHANNELS').as('channelsCategory');
        cy.get('@channelsCategory').find('#sidebarItem_town-square');

        // # Move the channel into a new category
        cy.uiMoveChannelToCategory('town-square', categoryName, true).as('newCategory');

        // * Verify that Town Square has moved into the new category
        cy.get('@newCategory').find('#sidebarItem_town-square').should('exist');
        cy.get('@channelsCategory').find('#sidebarItem_town-square').should('not.exist');

        // # Move the channel back to Channels
        cy.uiMoveChannelToCategory('town-square', 'Channels');

        // * Verify that Town Square has moved back to Channels
        cy.get('@newCategory').find('#sidebarItem_town-square').should('not.exist');
        cy.get('@channelsCategory').find('#sidebarItem_town-square').should('exist');
    });

    it('MM-T3349_5 should be able to copy the channel link', () => {
        stubClipboard().as('clipboard');

        // # Open the channel menu and select the Copy Link option
        cy.get('#sidebarItem_town-square').find('.SidebarMenu_menuButton').click({force: true});
        cy.get('.SidebarMenu').contains('.MenuItem', 'Copy Link').click();

        // Ensure that the clipboard contents are correct
        cy.get('@clipboard').its('wasCalled').should('eq', true);
        cy.location().then((location) => {
            cy.get('@clipboard').its('contents').should('eq', `${location.origin}/${teamName}/channels/town-square`);
        });
    });

    it('MM-T3349_6 should be able to open the add other users to the channel', () => {
        // # Open the channel menu and select the Add Members option
        cy.get('#sidebarItem_town-square').find('.SidebarMenu_menuButton').click({force: true});
        cy.get('.SidebarMenu').contains('.MenuItem', 'Add Members').click();

        // * Verify that the modal appears and then close it
        cy.contains('.modal-dialog .modal-header', 'Add New Members to').
            parents().
            find('.modal-dialog').
            findByLabelText('Close').
            click();
    });
});
