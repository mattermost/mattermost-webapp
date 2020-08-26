// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @websocket

import {testWithConfig} from '../../../support/hooks';

import {getRandomId} from '../../../utils';

describe('Handle removed user - new sidebar', () => {
    testWithConfig({
        ServiceSettings: {
            ExperimentalChannelSidebarOrganization: 'disabled',
        },
    });

    it('MM-27202 should add new channels to the sidebar when created from another session', () => {
        // # Start with a new team
        const teamName = `team-${getRandomId()}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('be.visible').should('contain', teamName);

        // # Create a new channel from another session
        const channelName = `channel-${getRandomId()}`;
        cy.getCurrentTeamId().then((currentTeamId) => {
            cy.apiCreateChannel(currentTeamId, channelName, channelName, 'O', '', '', false);
        });

        // Verify that the new channel is in the sidebar
        cy.get(`#sidebarItem_${channelName}`).should('be.visible');
    });
});
