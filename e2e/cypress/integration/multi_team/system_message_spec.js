// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
/* eslint max-nested-callbacks: ["error", 4] */

function verifySystemMessage(post) {
    cy.get(post).
        invoke('attr', 'class').
        should('contain', 'post--system').
        and('not.contain', 'same--root').
        and('not.contain', 'other--root').
        and('not.contain', 'current--user').
        and('not.contain', 'post--comment').
        and('not.contain', 'post--root');

    cy.get(post).
        find('.status-wrapper .status svg').
        should('not.be.visible');
}

describe('MM-15240 - no status on a system message', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    const displayTypes = ['compact', 'clean'];

    displayTypes.forEach((type) => {
        it(`should have no status with ${type} display`, () => {
            // # Set message display
            cy.apiSaveMessageDisplayPreference(type);

            // # Update the header
            cy.getCurrentChannelId().then((channelId) => {
                cy.apiPatchChannel(
                    channelId,
                    {header: ' Updating header'.repeat(Math.floor(Math.random() * 10))}
                );
            });

            // # Get last post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).as('SystemMessage');
            });

            // * Verify it is a system message and that the status icon is not visible
            verifySystemMessage('@SystemMessage');
        });
    });
});