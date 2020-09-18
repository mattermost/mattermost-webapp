// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Messaging', () => {
    let testTeam;
    let testChannel;
    let testUser;

    before(() => {
        cy.apiInitSetup().then(({team, channel, user}) => {
            testUser = user;
            testTeam = team;
            testChannel = channel;
        });
    });

    it('MM-T2167 Pin a post, view pinned posts', () => {
        // # Login as the other user
        cy.apiLogin(testUser);

        // # Visit a test channel and post a message
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.postMessage('This is a post that is going to be pinned.');

        cy.getLastPostId().then((postId) => {
            // # On a message in center channel, click then pin the post to the channel
            cy.getPostMenu(postId, 'Pin to Channel').click();

            // * Find the 'Pinned' span in the post pre-header to verify that the post was actually pinned
            cy.get(`#post_${postId}`).findByText('Pinned').should('exist');

            // # Click pin icon next to search box
            cy.get('#channelHeaderPinButton').should('exist').click();

            // * RHS title displays as "Pinned Posts in [channel name]"
            cy.get('#sidebar-right').should('be.visible').and('contain', 'Pinned posts').and('contain', `${testChannel.display_name}`);

            // * Pinned post appear in RHS
            cy.get(`#rhsPostMessageText_${postId}`).should('exist');
        });
    });
});
