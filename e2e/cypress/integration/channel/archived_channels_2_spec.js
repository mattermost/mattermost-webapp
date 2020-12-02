// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getAdminAccount} from '../../support/env';
import {getRandomId} from '../../utils';

describe('Leave an archived channel', () => {
    let testTeam;
    let testUser;

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
        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            testTeam = team;
            testUser = user;

            cy.visit(`/${team.name}/channels/town-square`);

            // # Wait for the team to load
            cy.get('#headerTeamName', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        });
    });

    it('MM-T1680 Open archived channel from search results with permalink view in another channel is open', () => {
        // # Visit the test team
        cy.visit(`/${testTeam.name}`);

        // # Create a new channel
        cy.uiCreateChannel({isNewSidebar: true});

        // # Make a post
        const archivedPostText = `archived${getRandomId()}`;
        cy.postMessage(archivedPostText);
        cy.getLastPostId().as('archivedPostId');

        // # Archive the newly created channel
        cy.uiArchiveChannel();

        // # Switch away from the archived channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Make a post outside of the archived channel
        const otherPostText = `post${getRandomId()}`;
        cy.postMessage(otherPostText);
        cy.getLastPostId().as('otherPostId');

        // # Search for the new post and jump to it from the search results
        cy.uiSearchPosts(otherPostText);
        cy.get('@otherPostId').then((otherPostId) => cy.uiJumpToSearchResult(otherPostId));

        // # Search for a post in the archived channel
        cy.uiSearchPosts(archivedPostText);

        // # Open it in the RHS
        cy.get('@archivedPostId').then((archivedPostId) => {
            cy.clickPostCommentIcon(archivedPostId, 'SEARCH');

            // * Verify that the RHS has switched from search results to the thread
            cy.get('#searchContainer').should('not.exist');
            cy.get('#rhsContainer').should('be.visible');

            // * Verify that the thread is visible and marked as archived
            cy.get(`#rhsPost_${archivedPostId}`).should('be.visible');
            cy.get('#rhsContainer .channel-archived-warning').should('be.visible');
        });
    });

    it('MM-T1687 App does not crash when another user archives a channel', () => {
        cy.makeClient({user: getAdminAccount()}).then((client) => {
            // # Have another user create a private channel
            const channelName = `channel${getRandomId()}`;
            cy.wrap(client.createChannel({
                display_name: channelName,
                name: channelName,
                team_id: testTeam.id,
                type: 'P',
            })).then((channel) => {
                // # Then invite us to it
                cy.wrap(client.addToChannel(testUser.id, channel.id));

                // * Verify that the newly created channel is in the sidebar
                cy.get(`#sidebarItem_${channel.name}`).should('be.visible');

                // # Then archive the channel
                cy.wrap(client.deleteChannel(channel.id));

                // * Verify that the channel is no longer in the sidebar and that the app hasn't crashed
                cy.get(`#sidebarItem_${channel.name}`).should('not.be.visible');
            });
        });
    });

    it('MM-T1688 archived channels only appear in search results as long as the user does not leave them', () => {
        // # Create a new channel
        cy.uiCreateChannel({isNewSidebar: true}).as('channel');

        // # Make a post
        const archivedPostText = `archived${getRandomId()}`;
        cy.postMessage(archivedPostText);
        cy.getLastPostId().as('archivedPostId');

        // # Archive the newly created channel
        cy.uiArchiveChannel();

        // # Switch away from the archived channel
        cy.get('#sidebarItem_town-square').click();

        // * Verify that the channel is no longer in the sidebar
        cy.get('@channel').then((channel) => {
            cy.get(`#sidebarItem_${channel.name}`).should('not.be.visible');
        });

        // # Search for the post
        cy.uiSearchPosts(archivedPostText);

        cy.get('@archivedPostId').then((archivedPostId) => {
            // * Verify that the post is shown in the search results
            cy.get(`#searchResult_${archivedPostId}`).should('be.visible');

            // # Switch back to the archived channel through the permalink
            cy.uiJumpToSearchResult(archivedPostId);
        });

        // * Wait for the permalink URL to disappear
        cy.get('@channel').then((channel) => {
            cy.url().should('include', `/${testTeam.name}/channels/${channel.name}`);
        });

        // # Leave the channel
        cy.uiLeaveChannel();

        // # Search for the post again
        cy.uiSearchPosts(archivedPostText);

        cy.get('@archivedPostId').then((archivedPostId) => {
            // * Verify that the post is no longer shown in the search results
            cy.get(`#searchResult_${archivedPostId}`).should('not.exist');
            cy.get('#search-items-container .no-results__wrapper').should('be.visible');
        });
    });
});
