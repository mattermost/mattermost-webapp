// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel_sidebar

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getAdminAccount} from '../../support/env';
import {getRandomId} from '../../utils';

describe('Channel sidebar', () => {
    const sysadmin = getAdminAccount();

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelSidebarOrganization: 'default_on',
            },
        });

        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('should switch channels when clicking on a channel in the sidebar', () => {
        // # Start with a new team
        const teamName = `team-${getRandomId()}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('be.visible').should('be.visible').should('contain', teamName);

        // # Click on Off Topic
        cy.get('.SidebarChannel:contains(Off-Topic)').should('be.visible').click();

        // * Verify that the channel changed
        cy.url().should('include', `/${teamName}/channels/off-topic`);
        cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').should('contain', 'Off-Topic');

        // # Click on Town Square
        cy.get('.SidebarChannel:contains(Town Square)').should('be.visible').click();

        // * Verify that the channel changed
        verifyChannelSwitch('Town Square', `/${teamName}/channels/town-square`);
    });

    it('should mark channel as read and unread in sidebar', () => {
        // # Start with a new team
        const teamName = `team-${getRandomId()}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('be.visible').should('contain', teamName);

        // * Verify that both Off Topic and Town Square are read
        cy.get('.SidebarChannel:not(.unread):contains(Off-Topic)').should('be.visible');
        cy.get('.SidebarChannel:not(.unread):contains(Town Square)').should('be.visible');

        // # Have another user post in the Off Topic channel
        cy.apiGetChannelByName(teamName, 'off-topic').then(({channel}) => {
            cy.postMessageAs({sender: sysadmin, message: 'Test', channelId: channel.id});
        });

        // * Verify that Off Topic is unread and Town Square is read
        cy.get('.SidebarChannel.unread:contains(Off-Topic)').should('be.visible');
        cy.get('.SidebarChannel:not(.unread):contains(Town Square)').should('be.visible');
    });

    it('should remove channel from sidebar after leaving it', () => {
        // # Start with a new team
        const teamName = `team-${getRandomId()}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('be.visible').should('contain', teamName);

        // # Switch to Off Topic
        cy.visit(`/${teamName}/channels/off-topic`);

        // # Wait for the channel to change
        cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').should('contain', 'Off-Topic');

        // # Click on the channel menu and select Leave Channel
        cy.get('#channelHeaderTitle').click();
        cy.get('#channelLeaveChannel').should('be.visible').click();

        // * Verify that we've switched to Town Square
        verifyChannelSwitch('Town Square', `/${teamName}/channels/town-square`);

        // * Verify that Off Topic has disappeared from the sidebar
        cy.get('.SidebarChannel:contains(Off-Topic)').should('not.exist');
    });

    it('MM-23239 should remove channel from sidebar after deleting it', () => {
        // # Start with a new team
        const teamName = `team-${getRandomId()}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('be.visible').should('contain', teamName);

        // # Switch to Off Topic
        cy.visit(`/${teamName}/channels/off-topic`);

        // # Wait for the channel to change
        cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').should('contain', 'Off-Topic');

        // # Click on the channel menu and select Leave Channel
        cy.get('#channelHeaderTitle').click();
        cy.get('#channelArchiveChannel').should('be.visible').click();
        cy.get('#deleteChannelModalDeleteButton').should('be.visible').click();

        // * Verify that we've switched to Town Square
        verifyChannelSwitch('Town Square', `/${teamName}/channels/town-square`);

        // * Verify that Off Topic has disappeared from the sidebar
        cy.get('.SidebarChannel:contains(Off-Topic)').should('not.exist');
    });

    function verifyChannelSwitch(displayName, url) {
        cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').should('contain', displayName);
        cy.url().should('include', url);
    }
});
