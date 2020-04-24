// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod @smoke
// Group: @channel_sidebar

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

    it('should move channel to correct place when dragging channel within category', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('be.visible').should('contain', teamName);

        // * Verify the order is correct to begin with
        cy.get('.SidebarChannel > .SidebarLink').should('be.visible').eq(0).should('contain', 'Off-Topic');
        cy.get('.SidebarChannel > .SidebarLink').should('be.visible').eq(1).should('contain', 'Town Square');

        // # Perform drag using keyboard
        cy.get('.SidebarChannel:contains(Off-Topic) > .SidebarLink')
            .trigger('keydown', { keyCode: 32 })
            .trigger('keydown', { keyCode: 40, force: true })
            .wait(3000)
            .trigger('keydown', { keyCode: 32, force: true });

        // * Verify that the elements have been re-ordered
        cy.get('.SidebarChannel > .SidebarLink').should('be.visible').eq(1).should('contain', 'Off-Topic');
        cy.get('.SidebarChannel > .SidebarLink').should('be.visible').eq(0).should('contain', 'Town Square');
    });

    it('should move category to correct place', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('be.visible').should('contain', teamName);

        // * Verify the order is correct to begin with
        cy.get('.SidebarChannelGroupHeader_groupButton > div[data-rbd-drag-handle-draggable-id]').should('be.visible').eq(0).should('contain', 'PUBLIC CHANNELS');
        cy.get('.SidebarChannelGroupHeader_groupButton > div[data-rbd-drag-handle-draggable-id]').should('be.visible').eq(1).should('contain', 'DIRECT MESSAGES');

        // # Perform drag using keyboard
        cy.get('.SidebarChannelGroupHeader_groupButton > div[data-rbd-drag-handle-draggable-id]').should('be.visible').eq(0).should('contain', 'PUBLIC CHANNELS')
            .trigger('keydown', { keyCode: 32 })
            .trigger('keydown', { keyCode: 40, force: true })
            .wait(3000)
            .trigger('keydown', { keyCode: 32, force: true });

        // * Verify that the elements have been re-ordered
        cy.get('.SidebarChannelGroupHeader_groupButton > div[data-rbd-drag-handle-draggable-id]').should('be.visible').eq(1).should('contain', 'PUBLIC CHANNELS');
        cy.get('.SidebarChannelGroupHeader_groupButton > div[data-rbd-drag-handle-draggable-id]').should('be.visible').eq(0).should('contain', 'DIRECT MESSAGES');

    });
});
