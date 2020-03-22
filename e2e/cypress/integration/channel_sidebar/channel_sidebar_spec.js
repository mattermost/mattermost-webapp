// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users';

import {testWithConfig} from '../../support/hooks';

import {getRandomInt} from '../../utils';

const sysadmin = users.sysadmin;

describe('Channel sidebar', () => {
    testWithConfig({
        ServiceSettings: {
            ExperimentalChannelSidebarOrganization: 'default_on',
        },
    });

    before(() => {
        cy.apiLogin('user-1');

        cy.visit('/');
    });

    it('should switch channels when clicking on a channel in the sidebar', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // # Click on Off Topic
        cy.get('.SidebarChannel:contains(Off-Topic)').should('be.visible').click();

        // * Verify that the channel changed
        cy.url().should('include', `/${teamName}/channels/off-topic`);
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');

        // # Click on Town Square
        cy.get('.SidebarChannel:contains(Town Square)').should('be.visible').click();

        // * Verify that the channel changed
        cy.url().should('include', `/${teamName}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('contain', 'Town Square');
    });

    it('should mark channel as read and unread in sidebar', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // * Verify that both Off Topic and Town Square are read
        cy.get('.SidebarChannel:not(.unread):contains(Off-Topic)').should('be.visible');
        cy.get('.SidebarChannel:not(.unread):contains(Town Square)').should('be.visible');

        // # Have another user post in the Off Topic channel
        cy.apiGetChannelByName(teamName, 'off-topic').then((response) => {
            expect(response.status).to.equal(200);

            const channel = response.body;
            cy.postMessageAs({sender: sysadmin, message: 'Test', channelId: channel.id});
        });

        // * Verify that Off Topic is unread and Town Square is read
        cy.get('.SidebarChannel.unread:contains(Off-Topic)').should('be.visible');
        cy.get('.SidebarChannel:not(.unread):contains(Town Square)').should('be.visible');
    });

    it('should remove channel from sidebar after leaving it', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // # Switch to Off Topic
        cy.visit(`/${teamName}/channels/off-topic`);

        // # Wait for the channel to change
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');

        // # Click on the channel menu and select Leave Channel
        cy.get('#channelHeaderTitle').click();
        cy.get('#channelLeaveChannel').click();

        // * Verify that we've switched to Town Square
        cy.url().should('include', `/${teamName}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('contain', 'Town Square');

        // * Verify that Off Topic has disappeared from the sidebar
        cy.get('.SidebarChannel:contains(Off-Topic)').should('not.exist');
    });

    it('MM-23239 should remove channel from sidebar after deleting it', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // # Switch to Off Topic
        cy.visit(`/${teamName}/channels/off-topic`);

        // # Wait for the channel to change
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');

        // # Click on the channel menu and select Leave Channel
        cy.get('#channelHeaderTitle').click();
        cy.get('#channelArchiveChannel').click();
        cy.get('#deleteChannelModalDeleteButton').click();

        // * Verify that we've switched to Town Square
        cy.url().should('include', `/${teamName}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('contain', 'Town Square');

        // * Verify that Off Topic has disappeared from the sidebar
        cy.get('.SidebarChannel:contains(Off-Topic)').should('not.exist');
    });
});
