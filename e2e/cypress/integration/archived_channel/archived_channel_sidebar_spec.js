// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel

import {getRandomId} from '../../utils';

describe('Archived channels appearing in the channel sidebar', () => {
    let testTeam;

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelSidebarOrganization: 'default_on',
            },
            TeamSettings: {
                ExperimentalViewArchivedChannels: true,
            },
        });

        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;
        });
    });

    it('Archived channel is visible in sidebar when the user is viewing it', () => {
        // # Visit the test team
        cy.visit(`/${testTeam.name}`);

        // # Create a new channel
        cy.uiCreateChannel({}, true).then((channel) => {
            // # Archive it
            cy.uiArchiveChannel();

            // * Verify that we're still viewing the archived channel
            cy.get('#channelHeaderTitle').should('contain', channel.name);

            // * Verify that the archived channel is still in the sidebar
            cy.get(`#sidebarItem_${channel.name}`).should('be.visible');
        });
    });

    it('MM-T1684 Archived channel is removed from drawer when you navigate away', () => {
        // # Visit the test team
        cy.visit(`/${testTeam.name}`);

        // # Create a new channel
        cy.uiCreateChannel({}, true).then((channel) => {
            // # Archive it
            cy.uiArchiveChannel();

            // * Verify that we're still viewing the archived channel
            cy.get('#channelHeaderTitle').should('contain', channel.name);

            // * Verify that the archived channel is still in the sidebar
            cy.get(`#sidebarItem_${channel.name}`).should('be.visible');

            // # Switch to another channel
            cy.get('#sidebarItem_town-square').click();

            // * Verify that we've changed channels
            cy.get('#channelHeaderTitle').should('contain', 'Town Square');

            // * Verify that the archived channel is no longer in the sidebar
            cy.get(`#sidebarItem_${channel.name}`).should('not.exist');
        });
    });
});
