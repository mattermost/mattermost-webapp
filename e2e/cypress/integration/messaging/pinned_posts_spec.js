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

            // # Click pin icon next to search box
            cy.get('#channelHeaderPinButton').should('exist').click();

            // * RHS title displays as "Pinned Posts" and "[channel name]"
            cy.get('#sidebar-right').should('be.visible').and('contain', 'Pinned posts').and('contain', `${testChannel.display_name}`);

            // * Pinned post appear in RHS
            cy.get(`#rhsPostMessageText_${postId}`).should('exist');

            // * Message has Pinned badge in center but not in "Pinned Posts" RHS
            cy.get(`#post_${postId}`).findByText('Pinned').should('exist');
            cy.get(`#rhsPostMessageText_${postId}`).findByText('Pinned').should('not.exist');
        });
    });
});
