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

    it('should display collapsed state when collapsed', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // * Verify that the category doesn't appear collapsed currently
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('be.visible').should('not.have.class', 'icon-rotate-minus-90');

        // # Click on PUBLIC CHANNELS
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS)').should('be.visible').click();

        // * Verify that the category now appears collapsed
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('have.class', 'icon-rotate-minus-90');
    });

    it('should collapse channels that are not the currently viewed channel', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team and are on Town Square
        cy.get('#headerTeamName').should('contain', teamName);
        cy.url().should('include', `/${teamName}/channels/town-square`);

        // * Verify that both channels are visible when not collapsed
        cy.get('.SidebarChannel:contains(Off-Topic)').should('be.visible');
        cy.get('.SidebarChannel:contains(Town Square)').should('be.visible');

        // # Click on PUBLIC CHANNELS
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS)').should('be.visible').click();

        // * Verify that Off-Topic is no longer visible but Town Square still is
        cy.get('.SidebarChannel:contains(Off-Topic)').should('not.be.visible');
        cy.get('.SidebarChannel:contains(Town Square)').should('be.visible');
    });

    it('should collapse channels that are not unread channels', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team and are on Town Square
        cy.get('#headerTeamName').should('contain', teamName);
        cy.url().should('include', `/${teamName}/channels/town-square`);

        // Create a new channel and post a message into it
        cy.getCurrentTeamId().then((teamId) => {
            cy.apiCreateChannel(teamId, 'channel-test', 'Channel Test').then((res) => {
                cy.postMessageAs({sender: sysadmin, message: 'Test', channelId: res.body.id});
            });
        });

        // * Verify that all channels are visible
        cy.get('.SidebarChannel:contains(Off-Topic)').should('be.visible');
        cy.get('.SidebarChannel:contains(Town Square)').should('be.visible').should('has.class', 'active');
        cy.get('.SidebarChannel:contains(Channel Test)').should('be.visible').should('has.class', 'unread');

        // # Click on PUBLIC CHANNELS
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS)').should('be.visible').click();

        // * Verify that Off-Topic is no longer visible but Town Square still is
        cy.get('.SidebarChannel:contains(Off-Topic)').should('not.be.visible');
        cy.get('.SidebarChannel:contains(Town Square)').should('be.visible');
        cy.get('.SidebarChannel:contains(Channel Test)').should('be.visible');
    });
});
