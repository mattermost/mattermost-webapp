// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel_sidebar

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

    it('should not show history arrows on the regular webapp', () => {
        // # Start with a new team
        const teamName = `team-${getRandomId()}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // * Verify both buttons don't exist
        cy.get('.SidebarChannelNavigator_backButton').should('not.exist');
        cy.get('.SidebarChannelNavigator_forwardButton').should('not.exist');
    });

    it('should switch to channel when using the channel switcher', () => {
        // # Start with a new team
        const teamName = `team-${getRandomId()}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // # Click the Channel Switcher button
        cy.get('.SidebarChannelNavigator_jumpToButton').should('be.visible').click();

        // # Search for Off-Topic and press Enter
        cy.get('.channel-switcher__suggestion-box #quickSwitchInput').click().type('Off-Topic');
        cy.get('.channel-switcher__suggestion-box #suggestionList').should('be.visible');
        cy.get('.channel-switcher__suggestion-box #quickSwitchInput').type('{enter}');

        // * Verify that the channel switcher is closed and the active channel is now Off-Topic
        cy.get('.channel-switch__modal').should('not.be.visible');
        cy.url().should('include', `/${teamName}/channels/off-topic`);
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');
        cy.get('.SidebarChannel.active:contains(Off-Topic)').should('be.visible');
    });
});
