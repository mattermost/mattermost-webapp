// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getRandomInt} from '../../utils';

import users from '../../fixtures/users.json';

let channel;
const channelDisplayName = `Message Reply ${getRandomInt(9999).toString()}`;
const sysadmin = users.sysadmin;

describe('Message Reply', () => {
    beforeEach(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // # Create a new channel for the test
        cy.getCurrentTeamId().then((teamId) => {
            cy.apiCreateChannel(teamId, 'channel-switcher', channelDisplayName).then((response) => {
                channel = response.body;

                // # Select the channel on the left hand side
                cy.get(`#sidebarItem_${channel.name}`).should('be.visible').scrollIntoView().click();
            });
        });
    });

    afterEach(() => {
        cy.getCurrentChannelId().then((channelId) => {
            cy.apiDeleteChannel(channelId);
        });
    });

    it('MM-16730 Reply to an older message', () => {
        cy.getCurrentChannelId().then((channelId) => {
            // # Get yesterdays date in UTC
            const yesterdaysDate = Cypress.moment().subtract(1, 'days').valueOf();

            // # Post a day old message
            cy.postMessageAs({sender: sysadmin, message: 'Hello from yesterday', channelId, createAt: yesterdaysDate}).
                its('id').
                should('exist').
                as('yesterdaysPost');
        });

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
                    cy.get(`#postMessageText_${replyId}`).should('be.visible').and('have.text', 'A reply to an older post with attachment');
                });

                cy.get(`#CENTER_time_${postId}`).find('#localDateTime').invoke('attr', 'title').then((originalTimeStamp) => {
                    // * Verify the first post timestamp equals the RHS timestamp
                    cy.get(`#RHS_ROOT_time_${postId}`).find('#localDateTime').invoke('attr', 'title').should('be', originalTimeStamp);

                    // * Verify the first post timestamp was not modified by the reply
                    cy.get(`#CENTER_time_${replyId}`).find('#localDateTime').should('have.attr', 'title').and('not.equal', originalTimeStamp);
                });
            });
        });

        // # Close RHS
        cy.closeRHS();

        // # Verify RHS is open
        cy.get('#rhsContainer').should('not.be.visible');
    });
});
