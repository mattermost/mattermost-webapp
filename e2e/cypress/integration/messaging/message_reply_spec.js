// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod @smoke
// Group: @messaging

import users from '../../fixtures/users.json';

const sysadmin = users.sysadmin;

describe('Message Reply', () => {
    let newChannel;

    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.apiSaveTeammateNameDisplayPreference('username');

        // # Create and visit new channel
        cy.createAndVisitNewChannel().then((channel) => {
            newChannel = channel;
        });
    });

    it('MM-16730 Reply to an older message', () => {
        // # Get yesterdays date in UTC
        const yesterdaysDate = Cypress.moment().subtract(1, 'days').valueOf();

        // # Post a day old message
        cy.postMessageAs({sender: sysadmin, message: 'Hello from yesterday', channelId: newChannel.id, createAt: yesterdaysDate}).
            its('id').
            should('exist').
            as('yesterdaysPost');

        // # Add two subsequent posts
        cy.postMessage('One');
        cy.postMessage('Two');

        cy.get('@yesterdaysPost').then((postId) => {
            // # Open RHS comment menu
            cy.clickPostCommentIcon(postId);

            // # Reply with the attachment
            cy.postMessageReplyInRHS('A reply to an older post with attachment');

            // # Get the latest reply post
            cy.getLastPostId().then((replyId) => {
                // * Verify that the reply is in the channel view with matching text
                cy.get(`#post_${replyId}`).within(() => {
                    cy.queryByTestId('post-link').should('be.visible').and('have.text', 'Commented on sysadmin\'s message: Hello from yesterday');
                    cy.get(`#postMessageText_${replyId}`).should('be.visible').and('have.text', 'A reply to an older post with attachment');
                });

                // * Verify that the reply is in the RHS with matching text
                cy.get(`#rhsPost_${replyId}`).within(() => {
                    cy.queryByTestId('post-link').should('not.be.visible');
                    cy.get(`#rhsPostMessageText_${replyId}`).should('be.visible').and('have.text', 'A reply to an older post with attachment');
                });

                cy.get(`#CENTER_time_${postId}`).find('time').invoke('attr', 'title').then((originalTimeStamp) => {
                    // * Verify the first post timestamp equals the RHS timestamp
                    cy.get(`#RHS_ROOT_time_${postId}`).find('time').invoke('attr', 'title').should('be', originalTimeStamp);

                    // * Verify the first post timestamp was not modified by the reply
                    cy.get(`#CENTER_time_${replyId}`).find('time').should('have.attr', 'title').and('not.equal', originalTimeStamp);
                });
            });
        });

        // # Close RHS
        cy.closeRHS();

        // # Verify RHS is open
        cy.get('#rhsContainer').should('not.be.visible');
    });
});
