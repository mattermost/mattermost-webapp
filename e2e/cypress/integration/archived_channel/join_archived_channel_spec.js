// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel

import {getAdminAccount} from '../../support/env';

describe('Archived channels', () => {
    let testTeam;
    let testUser;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;
        });
    });

    it('MM-T1682 Join an archived public channel by selecting a permalink to one of its posts', () => {
        // # Log in as another user
        cy.apiAdminLogin();

        // # Create a new channel
        cy.apiCreateChannel(testTeam.id, 'channel', 'channel').then(({channel}) => {
            // # Make a post in the new channel and get a permalink for it
            cy.postMessageAs({
                sender: getAdminAccount(),
                message: 'post',
                channelId: channel.id,
            }).then((post) => {
                const permalink = `/${testTeam.name}/pl/${post.id}`;

                // # Visit the channel
                cy.visit(`/${testTeam.name}/channels/${channel.name}`);

                // # Archive the channel
                cy.uiArchiveChannel();

                // # Log out and back in as the test user
                cy.apiLogin(testUser);

                // # Visit the permalink
                cy.visit(permalink);

                // * Verify that we've logged in as the test user
                cy.get('#headerUsername').should('contain', '@' + testUser.username);

                // * Verify that we've switched to the correct channel and that the header contains the archived icon
                cy.get('#channelHeaderTitle').should('contain', channel.display_name);
                cy.get('#channelHeaderInfo .icon__archive').should('be.visible');

                // * Verify that the channel is visible in the sidebar with the archived icon
                cy.get(`#sidebarItem_${channel.name}`).should('be.visible');
                cy.get(`#sidebarItem_${channel.name} .icon__archive`).should('be.visible');

                // * Verify that the archived channel banner is visible at the bottom of the channel view
                cy.get('#channelArchivedMessage').should('be.visible');
            });
        });
    });
});
