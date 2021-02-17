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
import {getAdminAccount} from '../../support/env';
import {getRandomId} from '../../utils';

import {clickCategoryMenuItem} from './helpers';

describe('Category muting', () => {
    let testTeam;
    let testUser;

    before(() => {
        cy.apiInitSetup({loginAfter: true}).then((({team, user}) => {
            testTeam = team;
            testUser = user;

            cy.visit(`/${team.name}/channels/town-square`);

            // # Wait for the team to load
            cy.get('#headerTeamName', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        }));
    });

    it('MM-T3488 category headers should be muted and unmuted correctly', () => {
        // * Verify that the Channels category and its channels start unmuted
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS)').should('be.visible').should('not.have.class', 'muted');
        cy.get('#sidebarItem_town-square').should('not.have.class', 'muted');
        cy.get('#sidebarItem_off-topic').should('not.have.class', 'muted');

        // # Mute the category
        clickCategoryMenuItem('channels', 'Mute Category');

        // * Verify that the category has been muted
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS)').should('have.class', 'muted');
        cy.get('#sidebarItem_town-square').should('have.class', 'muted');
        cy.get('#sidebarItem_off-topic').should('have.class', 'muted');

        // # Unmute the category
        clickCategoryMenuItem('channels', 'Unmute Category');

        // * Verify that the category is no longer muted
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS)').should('have.class', 'muted');
        cy.get('#sidebarItem_town-square').should('not.have.class', 'muted');
        cy.get('#sidebarItem_off-topic').should('not.have.class', 'muted');
    });

    it('MM-T3489_1 moving a channel into a muted category should mute it', () => {
        // # Create a new category
        cy.uiCreateSidebarCategory().then((category) => {
            // # Mute the new category
            clickCategoryMenuItem(category.displayName, 'Mute Category');

            // * Verify that Town Square starts unmuted
            cy.get('#sidebarItem_town-square').should('not.have.class', 'muted');

            // * Verify that the new category is muted
            cy.get(`.SidebarChannelGroupHeader:contains(${category.displayName})`).should('have.class', 'muted');

            // # Move Town Square into the custom category
            cy.uiMoveChannelToCategory('town-square', category.displayName);

            // * Verify that Town Square is now muted
            cy.get('#sidebarItem_town-square').should('have.class', 'muted');

            // # Move Town Square back to Channels
            cy.uiMoveChannelToCategory('town-square', 'CHANNELS');

            // * Verify that Town Square is now unmuted
            cy.get('#sidebarItem_town-square').should('not.have.class', 'muted');
        });
    });

    it('MM-T3489_2 being added to a new channel should not mute it, even if the Channels category is muted', () => {
        // * Verify that the Channels category starts unmuted
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS)').should('be.visible').should('not.have.class', 'muted');

        // # Mute Channels
        clickCategoryMenuItem('channels', 'Mute Category');

        cy.makeClient({user: getAdminAccount()}).then((client) => {
            // # Have another user create a channel
            const channelName = `channel${getRandomId()}`;
            cy.wrap(client.createChannel({
                display_name: channelName,
                name: channelName,
                team_id: testTeam.id,
                type: 'O',
            })).then((channel) => {
                // # And then invite us to it
                cy.wrap(client.addToChannel(testUser.id, channel.id));

                // * Verify that the test channel appears in the sidebar and is unmuted
                cy.get(`#sidebarItem_${channel.name}`).should('be.visible').should('not.have.class', 'muted');
            });
        });
    });
});
