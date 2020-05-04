// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod @smoke
// Group: @channel_sidebar

import {testWithConfig} from '../../support/hooks';

import {getRandomInt} from '../../utils';

const SpaceKeyCode = 32;
const DownArrowKeyCode = 40;

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
        cy.get('.SidebarChannel:contains(Off-Topic) > .SidebarLink').trigger('keydown', {keyCode: SpaceKeyCode}).trigger('keydown', {keyCode: DownArrowKeyCode, force: true}).wait(3000).trigger('keydown', {keyCode: SpaceKeyCode, force: true});

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
        // Wait for Public Channels to be visible since for some reason it shows up later...
        cy.get('.SidebarChannelGroupHeader_groupButton > div[data-rbd-drag-handle-draggable-id]').should('contain', 'PUBLIC CHANNELS').should('be.visible');
        cy.get('.SidebarChannelGroupHeader_groupButton > div[data-rbd-drag-handle-draggable-id]').should('be.visible').eq(0).should('contain', 'PUBLIC CHANNELS');
        cy.get('.SidebarChannelGroupHeader_groupButton > div[data-rbd-drag-handle-draggable-id]').should('be.visible').eq(1).should('contain', 'Direct Messages');

        // # Perform drag using keyboard
        cy.get('.SidebarChannelGroupHeader_groupButton > div[data-rbd-drag-handle-draggable-id]').should('be.visible').eq(0).should('contain', 'PUBLIC CHANNELS').trigger('keydown', {keyCode: SpaceKeyCode}).trigger('keydown', {keyCode: DownArrowKeyCode, force: true}).wait(3000).trigger('keydown', {keyCode: SpaceKeyCode, force: true}).wait(3000);

        // * Verify that the elements have been re-ordered
        cy.get('.SidebarChannelGroupHeader_groupButton > div[data-rbd-drag-handle-draggable-id]').should('be.visible').eq(1).should('contain', 'PUBLIC CHANNELS');
        cy.get('.SidebarChannelGroupHeader_groupButton > div[data-rbd-drag-handle-draggable-id]').should('be.visible').eq(0).should('contain', 'Direct Messages');
    });
});
