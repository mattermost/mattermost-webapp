// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {getRandomInt} from '../../utils';

describe('Channel sidebar', () => {
    beforeEach(() => {
        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // Enable Experimental Channel Sidebar Organization
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelSidebarOrganization: 'default_on',
            },
        });

        // # Visit the Town Square channel
        cy.visit('/ad-1/channels/town-square');
    });

    it('should not show history arrows on the regular webapp', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // * Verify both buttons don't exist
        cy.get('.SidebarChannelNavigator_backButton').should('not.exist');
        cy.get('.SidebarChannelNavigator_forwardButton').should('not.exist');
    });

    it('should switch to channel when using the channel switcher', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // # Click the Channel Switcher button
        cy.get('.SidebarChannelNavigator_jumpToButton').should('be.visible').click();

        // # Search for Off-Topic and press Enter
        cy.get('.channel-switch__suggestion-box #quickSwitchInput').type('Off-Topic');
        cy.get('.channel-switch__suggestion-box #suggestionList').should('be.visible');
        cy.get('.channel-switch__suggestion-box #quickSwitchInput').type('{enter}');

        // * Verify that the channel switcher is closed and the active channel is now Off-Topic
        cy.get('.channel-switch__modal').should('not.be.visible');
        cy.url().should('include', `/${teamName}/channels/off-topic`);
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');
        cy.get('.SidebarChannel.active:contains(Off-Topic)').should('be.visible');
    });
});
