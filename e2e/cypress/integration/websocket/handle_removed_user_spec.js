// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {testWithConfig} from '../../support/hooks';

import {getRandomInt} from '../../utils';

describe('Handle removed user - old sidebar', () => {
    before(() => {
        cy.apiLogin('user-1');

        cy.visit('/');
    });

    it('should be redirected to last channel when a user is removed from their current channel', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('be.visible').should('be.visible').should('contain', teamName);

        // # Click on Off Topic
        cy.get('.SidebarChannel:contains(Off-Topic)').should('be.visible').click();

        // * Verify that the channel changed
        cy.url().should('include', `/${teamName}/channels/off-topic`);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Off-Topic');

        // # Remove the Guest User from channel
        let channelId;
        cy.getCurrentChannelId().then((res) => {
            channelId = res;
            return cy.apiGetMe();
        }).then((res) => {
            const userId = res.body.id;
            return cy.removeUserFromChannel(channelId, userId);
        }).then(() => {
            // * Verify that the channel changed back to Town Square and that Off-Topic has been removed
            cy.url().should('include', `/${teamName}/channels/town-square`);
            cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');
            cy.get('.SidebarChannel:contains(Off-Topic)').should('not.exist');
        });
    });
});

describe('Handle removed user - new sidebar', () => {
    testWithConfig({
        ServiceSettings: {
            ExperimentalChannelSidebarOrganization: 'default_on',
        },
    });

    before(() => {
        cy.apiLogin('user-1');

        cy.visit('/');
    });

    it('should be redirected to last channel when a user is removed from their current channel', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('be.visible').should('be.visible').should('contain', teamName);

        // # Click on Off Topic
        cy.get('.SidebarChannel:contains(Off-Topic)').should('be.visible').click();

        // * Verify that the channel changed
        cy.url().should('include', `/${teamName}/channels/off-topic`);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Off-Topic');

        // # Remove the Guest User from channel
        let channelId;
        cy.getCurrentChannelId().then((res) => {
            channelId = res;
            return cy.apiGetMe();
        }).then((res) => {
            const userId = res.body.id;
            return cy.removeUserFromChannel(channelId, userId);
        }).then(() => {
            // * Verify that the channel changed back to Town Square
            cy.url().should('include', `/${teamName}/channels/town-square`);
            cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');
        });
    });
});
