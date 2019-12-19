// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';
import users from '../../fixtures/users.json';

let townsquareChannelId;

describe('Messaging', () => {
    before(() => {
        // # Wrap websocket to be able to connect and close connections on demand
        cy.mockWebsockets();

        // # Login and go to /
        cy.apiLogin('sysadmin');
        cy.visit('/');

        // # Get ChannelID to use later
        cy.getCurrentChannelId().then((id) => {
            townsquareChannelId = id;
        });
    });

    it('M18682-RHS fetches messages on socket reconnect when a different channel is in center', () => {
        // # Connect all sockets
        window.mockWebsockets.forEach((value) => {
            value.connect();
        });

        // # Post a message as another user
        cy.postMessageAs({sender: users['user-1'], message: 'abc', channelId: townsquareChannelId}).wait(TIMEOUTS.SMALL);

        // # Click "Reply"
        cy.getLastPostId().then((rootPostId) => {
            cy.clickPostCommentIcon(rootPostId);

            // # Post a message
            cy.postMessageReplyInRHS('def');

            // # Change channel
            cy.get('#sidebarItem_suscipit-4').click({force: true}).then(() => {
                // # Close all sockets
                window.mockWebsockets.forEach((value) => {
                    if (value.close) {
                        value.close();
                    }
                });

                // # Post message as a different user
                cy.postMessageAs({sender: users['user-1'], message: 'ghi', channelId: townsquareChannelId, rootId: rootPostId});

                // # Wait a short time to check whether the message appears or not
                cy.wait(TIMEOUTS.SMALL);

                // * Verify that only "def" is posted and not "ghi"
                cy.get('#rhsPostList').should('be.visible').children().should('have.length', 1);
                cy.get('#rhsPostList').within(() => {
                    cy.findByText('def').should('be.visible');
                    cy.queryByText('ghi').should('not.exist');
                }).then(() => {
                    // * Connect all sockets one more time
                    window.mockWebsockets.forEach((value) => {
                        value.connect();
                    });

                    // # Wait for sockets to be connected
                    cy.wait(TIMEOUTS.MEDIUM);

                    // * Verify that both "def" and "ghi" are posted on websocket reconnect
                    cy.get('#rhsPostList').should('be.visible').children().should('have.length', 2);
                    cy.get('#rhsPostList').within(() => {
                        cy.findByText('def').should('be.visible');
                        cy.findByText('ghi').should('be.visible');
                    });
                });
            });
        });
    });
});
