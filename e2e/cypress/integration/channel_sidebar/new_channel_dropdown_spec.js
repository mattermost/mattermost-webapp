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
import {getRandomId} from '../../utils';

describe('Channel sidebar', () => {
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

    it('should create a new channel when using the new channel dropdown', () => {
        // # Start with a new team
        const teamName = `team-${getRandomId()}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // # Click the New Channel Dropdown button
        cy.get('.AddChannelDropdown_dropdownButton').should('be.visible').click();

        // # Click the Create New Channel dropdown item
        cy.get('.AddChannelDropdown .MenuItem:contains(Create New Channel) button').should('be.visible').click();

        // * Verify that the new channel modal is visible
        cy.get('.new-channel__modal').should('be.visible');

        // # Add the new channel name and press Create Channel
        cy.get('.new-channel__modal #newChannelName').should('be.visible').type('Test Channel');
        cy.get('.new-channel__modal #submitNewChannel').should('be.visible').click();

        // Verify that new channel is in the sidebar and is active
        cy.get('.new-channel__modal').should('not.be.visible');
        cy.url().should('include', `/${teamName}/channels/test-channel`);
        cy.get('#channelHeaderTitle').should('contain', 'Test Channel');
        cy.get('.SidebarChannel.active:contains(Test Channel)').should('be.visible');
    });

    it('should join a new public channel when using the new channel dropdown', () => {
        // # Start with a new team
        const teamName = `team-${getRandomId()}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // # Switch to Off Topic
        cy.visit(`/${teamName}/channels/off-topic`);

        // # Wait for the channel to change
        cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('contain', 'Off-Topic');

        // # Click on the channel menu and select Leave Channel
        cy.get('#channelHeaderTitle').click();
        cy.get('#channelLeaveChannel').click();

        // * Verify that we've switched to Town Square
        cy.get('#channelHeaderTitle').should('contain', 'Town Square');
        cy.url().should('include', `/${teamName}/channels/town-square`);

        // # Click the New Channel Dropdown button
        cy.get('.AddChannelDropdown_dropdownButton').should('be.visible').click();

        // # Click the Browse Channels dropdown item
        cy.get('.AddChannelDropdown .MenuItem:contains(Browse Channels) button').should('be.visible').click();

        // * Verify that the more channels modal is visible
        cy.get('.more-modal').should('be.visible');

        // Click the Off-Topic channel
        cy.get('.more-modal button:contains(Off-Topic)').should('be.visible').click();

        // Verify that new channel is in the sidebar and is active
        cy.get('.more-modal').should('not.be.visible');
        cy.url().should('include', `/${teamName}/channels/off-topic`);
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');
        cy.get('.SidebarChannel.active:contains(Off-Topic)').should('be.visible');
    });
});
