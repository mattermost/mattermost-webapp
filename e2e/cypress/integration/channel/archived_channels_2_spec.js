// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel

import {getRandomId} from '../../utils';

describe('Leave an archived channel', () => {
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
});
