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

describe('System Message', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('MM-15240 - No status on a system message', () => {
        // const channelHeader = ' Updating header'.repeat(Math.floor(Math.random() * 10));
        const displayTypes = ['COMPACT', 'STANDARD'];

        displayTypes.forEach((type) => {
            it(`has no status on ${type} display`, () => {
                // # Set message display
                cy.changeMessageDisplaySetting(type);

                // # Update the header to a long string
                // cy.updateChannelHeader('>' + channelHeader);
                cy.getCurrentChannelId().then((channelId) => {
                    cy.apiUpdateChannel({
                        channelId: channelId,
                        header: ' Updating header'.repeat(Math.floor(Math.random() * 10)),
                    }).then((response) => {
                        if (response.status_code === 200) {
                            // # Get last post
                            cy.getLastPostId().then((postId) => {
                                cy.get(`#post_${postId}`).as('SystemMessage');
                            });

                            // * Verify it is a system message and that the status icon is not visible
                            verifySystemMessage('@SystemMessage');
                        } else {
                            cy.url().should('include', 'pizza');
                        }
                    });
                });
            });
        });
    });
});