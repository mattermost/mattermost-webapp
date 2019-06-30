// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

function checkForStatus(post) {
    post.
        invoke('attr', 'class').
            should('contain', 'post--system').
            should('not.contain', 'same--root').
            should('not.contain', 'other--root').
            should('not.contain', 'current--user').
            should('not.contain', 'post--comment').
            should('not.contain', 'post--root');
}

/* eslint max-nested-callbacks: ["error", 4] */
describe('System Message', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('MM-15240 - No status on a system message', () => {
        const channelHeader = ' Updating header to test system message status'.repeat(5);

        // # Update the header to a long string
        cy.updateChannelHeader('>' + channelHeader);

        // # Get last post
        cy.getLastPostId().then((postId) => {
            checkForStatus(cy.get(`#post_${postId}`));                
        });
    });
});