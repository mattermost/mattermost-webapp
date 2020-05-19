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

                // Force a reload to ensure the unread message displays
                cy.reload();

                // * Verify that all channels are visible
                cy.get('.SidebarChannel:contains(Off-Topic)').should('be.visible');
                cy.get('.SidebarChannel:contains(Channel Test)').should('be.visible').should('has.class', 'unread');

                // # Click on PUBLIC CHANNELS
                cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS)').should('be.visible').click();

                // * Verify that Off-Topic is no longer visible but Channel Test still is
                cy.get('.SidebarChannel:contains(Off-Topic)').should('not.be.visible');
                cy.get('.SidebarChannel:contains(Channel Test)').should('be.visible');
            });
        });
    });

    it('should save collapsed state and remember the state on refresh', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // * Verify that the category doesn't appear collapsed currently
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('be.visible').should('not.have.class', 'icon-rotate-minus-90');

        // # Click on PUBLIC CHANNELS
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS)').should('be.visible').click();

        // * Verify that the category appears collapsed after refresh
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('have.class', 'icon-rotate-minus-90');

        // Wait for state to settle
        // This is necessary since we have no observable way of finding out when the state actually settles so that it persists on reload
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);

        // # Reload the page
        cy.reload();

        // * Verify that the category still appears collapsed after refresh
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('have.class', 'icon-rotate-minus-90');

        // # Click on PUBLIC CHANNELS
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS)').should('be.visible').click();

        // * Verify that the category appears not collapsed after refresh
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('not.have.class', 'icon-rotate-minus-90');

        // Wait for state to settle
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);

        // # Reload the page
        cy.reload();

        // * Verify that the category still appears not collapsed after refresh
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('not.have.class', 'icon-rotate-minus-90');
    });

    it('should change the text state when the unread filter changes state', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team and are on Town Square
        cy.get('#headerTeamName').should('contain', teamName);
        cy.url().should('include', `/${teamName}/channels/town-square`);

        // * Verify that the unread filter is in all channels state
        cy.get('.SidebarFilters:contains(VIEWING:)').should('be.visible');
        cy.get('.SidebarFilters:contains(All channels)').should('be.visible');

        // # Enable the unread filter
        cy.get('.SidebarFilters_filterButton').should('be.visible').click();

        // * Verify that the unread filter is in filter by unread state
        cy.get('.SidebarFilters:contains(FILTERED BY:)').should('be.visible');
        cy.get('.SidebarFilters:contains(Unread)').should('be.visible');

        // # Disable the unread filter
        cy.get('.SidebarFilters_filterButton').should('be.visible').click();

        // * Verify that the unread filter is back in all channels state
        cy.get('.SidebarFilters:contains(VIEWING:)').should('be.visible');
        cy.get('.SidebarFilters:contains(All channels)').should('be.visible');
    });

    it('should only show unreads when the unread filter is enabled', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team and are on Town Square
        cy.get('#headerTeamName').should('contain', teamName);
        cy.url().should('include', `/${teamName}/channels/town-square`);

        // # Create a new channel and post a message into it
        cy.getCurrentTeamId().then((teamId) => {
            cy.apiCreateChannel(teamId, 'channel-test', 'Channel Test').then((res) => {
                cy.postMessageAs({sender: sysadmin, message: 'Test', channelId: res.body.id});

                // Force a reload to ensure the unread message displays
                cy.reload();

                // * Verify that all channels are visible
                cy.get('.SidebarChannel:contains(Off-Topic)').should('be.visible');
                cy.get('.SidebarChannel:contains(Channel Test)').should('be.visible').should('has.class', 'unread');

                // # Enable the unread filter
                cy.get('.SidebarFilters_filterButton').should('be.visible').click();

                // * Verify that Off-Topic is no longer visible but Channel Test still is
                cy.get('.SidebarChannel:contains(Off-Topic)').should('not.be.visible');
                cy.get('.SidebarChannel:contains(Channel Test)').should('be.visible');
            });
        });
    });

    it('should collapse all categories when the unread filter is enabled', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team and are on Town Square
        cy.get('#headerTeamName').should('contain', teamName);
        cy.url().should('include', `/${teamName}/channels/town-square`);

        // * Verify that all categories are visible
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS)').should('be.visible');
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('be.visible').should('not.have.class', 'icon-rotate-minus-90');
        cy.get('.SidebarChannelGroupHeader:contains(Direct Messages)').should('be.visible');
        cy.get('.SidebarChannelGroupHeader:contains(Direct Messages) i').should('be.visible').should('not.have.class', 'icon-rotate-minus-90');

        // # Enable the unread filter
        cy.get('.SidebarFilters_filterButton').should('be.visible').click();

        // * Verify that all categories are collapsed
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('have.class', 'icon-rotate-minus-90');
        cy.get('.SidebarChannelGroupHeader:contains(Direct Messages) i').should('have.class', 'icon-rotate-minus-90');

        // # Disable the unread filter
        cy.get('.SidebarFilters_filterButton').should('be.visible').click();

        // * Verify that all categories are not collapsed
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('not.have.class', 'icon-rotate-minus-90');
        cy.get('.SidebarChannelGroupHeader:contains(Direct Messages) i').should('not.have.class', 'icon-rotate-minus-90');
    });

    it('should retain the collapsed state of categories when unread filter is enabled/disabled', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team and are on Town Square
        cy.get('#headerTeamName').should('contain', teamName);
        cy.url().should('include', `/${teamName}/channels/town-square`);

        // * Verify that all categories are visible
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS)').should('be.visible');
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('be.visible').should('not.have.class', 'icon-rotate-minus-90');
        cy.get('.SidebarChannelGroupHeader:contains(Direct Messages)').should('be.visible');
        cy.get('.SidebarChannelGroupHeader:contains(Direct Messages) i').should('be.visible').should('not.have.class', 'icon-rotate-minus-90');

        // # Collapse PUBLIC CHANNELS
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS)').should('be.visible').click();

        // * Verify that PUBLIC CHANNELS is collapsed
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('have.class', 'icon-rotate-minus-90');

        // # Enable the unread filter
        cy.get('.SidebarFilters_filterButton').should('be.visible').click();

        // * Verify that all categories are collapsed
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('have.class', 'icon-rotate-minus-90');
        cy.get('.SidebarChannelGroupHeader:contains(Direct Messages) i').should('have.class', 'icon-rotate-minus-90');

        // # Disable the unread filter
        cy.get('.SidebarFilters_filterButton').should('be.visible').click();

        // * Verify that Direct Messages is not collapsed but PUBLIC CHANNELS still is
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('be.visible').should('have.class', 'icon-rotate-minus-90');
        cy.get('.SidebarChannelGroupHeader:contains(Direct Messages) i').should('be.visible').should('not.have.class', 'icon-rotate-minus-90');
    });

    it('should not persist the state of the unread filter on reload', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team and are on Town Square
        cy.get('#headerTeamName').should('contain', teamName);
        cy.url().should('include', `/${teamName}/channels/town-square`);

        // * Verify that all categories are visible
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS)').should('be.visible');
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('be.visible').should('not.have.class', 'icon-rotate-minus-90');
        cy.get('.SidebarChannelGroupHeader:contains(Direct Messages)').should('be.visible');
        cy.get('.SidebarChannelGroupHeader:contains(Direct Messages) i').should('be.visible').should('not.have.class', 'icon-rotate-minus-90');

        // # Enable the unread filter
        cy.get('.SidebarFilters_filterButton').should('be.visible').click();

        // * Verify that all categories are collapsed
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('have.class', 'icon-rotate-minus-90');
        cy.get('.SidebarChannelGroupHeader:contains(Direct Messages) i').should('have.class', 'icon-rotate-minus-90');

        // # Reload the page
        cy.reload();

        // * Verify that all categories are not collapsed
        cy.get('.SidebarChannelGroupHeader:contains(PUBLIC CHANNELS) i').should('be.visible').should('not.have.class', 'icon-rotate-minus-90');
        cy.get('.SidebarChannelGroupHeader:contains(Direct Messages) i').should('be.visible').should('not.have.class', 'icon-rotate-minus-90');
    });
});
