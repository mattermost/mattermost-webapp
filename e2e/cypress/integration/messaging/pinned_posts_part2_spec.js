// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Pinned posts part 2', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let otherUser;

    before(() => {
        cy.apiInitSetup().then(({team, channel, user}) => {
            testUser = user;
            testTeam = team;
            testChannel = channel;
            return cy.apiCreateUser();
        }).then(({user: user1}) => {
            otherUser = user1;
            return cy.apiAddUserToTeam(testTeam.id, otherUser.id);
        }).then(() => {
            cy.apiAddUserToChannel(testChannel.id, otherUser.id);
        });
    });

    it('MM-T2173 Un-pinning a post from reply RHS also removes badge in center', () => {
        // # Login
        cy.apiLogin(testUser);

        // # Visit a test channel and post a message
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.postMessage('Hello');

        cy.getLastPostId().then((postId) => {
            // # Pin the post
            pinPost(postId);

            // # Now open RHS
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.get(`#CENTER_commentIcon_${postId}`).click({force: true});

            // * Verify that pinned icon is there both in center and RHS
            cy.get(`#rhsPost_${postId} .post-pre-header`).should('have.text', 'Pinned');
            cy.get(`#post_${postId} .post-pre-header`).should('have.text', 'Pinned');

            // # Un-pin the post from RHS
            unpinPost(postId);

            // * Verify that pinned icon is gone from center and RHS
            cy.get(`#rhsPost_${postId} .post-pre-header`).should('not.have.text', 'Pinned');
            cy.get(`#post_${postId} .post-pre-header`).should('not.have.text', 'Pinned');

            // # Click pin icon
            cy.get('#channelHeaderPinButton').should('be.visible').click();

            // * Should not have any pinned posts
            cy.get('#search-items-container .no-results__title').should('have.text', 'No pinned posts yet');
        });
    });

    it('MM-T2174 Switching channels in center also changes pinned posts RHS', () => {
        // # Login
        cy.apiLogin(testUser);

        // # Visit a test channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        cy.getLastPostId().then((postId) => {
            // # Pin the post
            pinPost(postId);

            // # Click pin icon
            cy.get('#channelHeaderPinButton').should('be.visible').click();

            // * Number of pinned posts in RHS should be 1
            cy.findByTestId('search-item-container').should('have.length', 1);

            // # Go to town square
            cy.get('#sidebarItem_town-square').should('be.visible').click();

            // * Should not have any pinned posts
            cy.get('#search-items-container .no-results__title').should('have.text', 'No pinned posts yet');

            // * Number of pinned posts in RHS should be 0
            cy.findByTestId('search-item-container').should('not.exist');

            // # Visit a test channel
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

            // # Unpin the post again
            unpinPost(postId);
        });
    });

    it('MM-T2175 Pin a post in a DM channel Pin a post while viewing empty pinned post RHS', () => {
        // # Create DM Channel
        cy.apiCreateDirectChannel([testUser.id, otherUser.id]).then(() => {
            cy.apiLogin(testUser);

            // # Visit the DM channel
            cy.visit(`/${testTeam.name}/channels/${testUser.id}__${otherUser.id}`);

            // # Click pin icon
            cy.get('#channelHeaderPinButton').should('be.visible').click();

            // # Post a message
            cy.postMessage('Hello');

            return cy.getLastPostId();
        }).then((postId) => {
            // # Pin the post
            pinPost(postId);

            // # Now open RHS
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.get(`#CENTER_commentIcon_${postId}`).click({force: true});

            // * Verify that pinned icon is there both in center and RHS
            cy.get(`#rhsPost_${postId} .post-pre-header`).should('have.text', 'Pinned');
            cy.get(`#post_${postId} .post-pre-header`).should('have.text', 'Pinned');
        });
    });

    it('MM-T2177 Deleting pinned post while viewing RHS pinned posts removes post from RHS', () => {
        // # Login
        cy.apiLogin(testUser);

        // # Visit a test channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Click pin icon
        cy.get('#channelHeaderPinButton').should('be.visible').click();

        // * Should not have any pinned posts
        cy.get('#search-items-container .no-results__title').should('have.text', 'No pinned posts yet');

        // # Post a message
        cy.postMessage('Hello again');

        cy.getLastPostId().then((postId) => {
            // # Pin the post
            pinPost(postId);

            // # Now open RHS
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.get(`#CENTER_commentIcon_${postId}`).click({force: true});

            // * Verify that pinned icon is there both in center and RHS
            cy.get(`#rhsPost_${postId} .post-pre-header`).should('have.text', 'Pinned');
            cy.get(`#post_${postId} .post-pre-header`).should('have.text', 'Pinned');

            // # Now delete the post
            cy.get(`#CENTER_button_${postId}`).click({force: true});
            cy.get(`#delete_post_${postId}`).scrollIntoView().should('be.visible').click();
            cy.get('#deletePostModalButton').should('be.visible').click();

            // # Click pin icon
            cy.get('#channelHeaderPinButton').should('be.visible').click();

            // * Should not have any pinned posts
            cy.get('#search-items-container .no-results__title').should('have.text', 'No pinned posts yet');

            // * Post should be deleted
            cy.get(`#post_${postId}`).should('not.exist');
            cy.get(`#rhsPost_${postId}`).should('not.exist');
        });
    });

    it('MM-T2922 Pinned post count indicates the number of pinned posts in currently viewed channel', () => {
        // # Login
        cy.apiLogin(testUser);

        // # Visit town square
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // * Pinned count should be zero
        cy.get('#channelPinnedPostCountText').should('not.exist');

        // # Post a message
        cy.postMessage('Town-square post');

        cy.getLastPostId().then((postId) => {
            // # Pin the post
            pinPost(postId);

            // * Pinned count should be 1
            cy.get('#channelPinnedPostCountText').should('have.text', '1');

            // # Visit a test channel
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

            // * Pinned count should be zero
            cy.get('#channelPinnedPostCountText').should('not.exist');

            // # Post a message
            cy.postMessage('Hello pinned post');

            return cy.getLastPostId();
        }).then((postId) => {
            // # Pin the post
            pinPost(postId);

            // * Pinned count should be 1
            cy.get('#channelPinnedPostCountText').should('have.text', '1');

            // # Unpin the post
            unpinPost(postId);

            // * Pinned count should be zero
            cy.get('#channelPinnedPostCountText').should('not.exist');

            // # Pin the post
            pinPost(postId);

            // # Post a message
            cy.postMessage('Hello second post');

            return cy.getLastPostId();
        }).then((postId) => {
            // # Pin the post
            pinPost(postId);

            // * Pinned count should be 2
            cy.get('#channelPinnedPostCountText').should('have.text', '2');

            // # Click pin icon
            cy.get('#channelHeaderPinButton').should('be.visible').click();

            // # Go to town square
            cy.get('#sidebarItem_town-square').should('be.visible').click();

            // * Pinned count should be 1
            cy.get('#channelPinnedPostCountText').should('have.text', '1');

            // * Number of pinned posts in RHS should also be 1
            cy.findByTestId('search-item-container').should('have.length', 1);
        });
    });
});

function pinPost(postId) {
    cy.get(`#post_${postId}`).trigger('mouseover');
    cy.get(`#CENTER_button_${postId}`).click({force: true});
    cy.get(`#pin_post_${postId}`).scrollIntoView().should('be.visible').click();
}

function unpinPost(postId) {
    cy.get(`#post_${postId}`).trigger('mouseover');
    cy.get(`#CENTER_button_${postId}`).click({force: true});
    cy.get(`#unpin_post_${postId}`).scrollIntoView().should('be.visible').click();
}
