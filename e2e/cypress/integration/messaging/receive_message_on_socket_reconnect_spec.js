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
let realWebSocket;
let websockets = [];

describe('Messaging', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('sysadmin');
        cy.visit('/');

        // # Get ChannelID to use later
        cy.getCurrentChannelId().then((id) => {
            townsquareChannelId = id;
        });

        // # Wrap websocket to be able to connect and close connections on demand
        cy.on('window:before:load', (win) => {
            realWebSocket = WebSocket;
            cy.stub(win, 'WebSocket').callsFake((...args) => {
                let mockWebSocket = {
                    wrappedSocket: undefined,
                    onopen: undefined,
                    onmessage: undefined,
                    onerror: undefined,
                    onclose: undefined,
                    send: function(data) {
                        if (this.wrappedSocket) {
                            this.wrappedSocket.send(data);
                        } else {
                            onerror();
                        }
                    },
                    close: function() {
                        if (this.wrappedSocket) {
                            this.wrappedSocket.close(1000);
                        }
                    },
                    connect: function() {
                        this.wrappedSocket = new realWebSocket(...args);
                        this.wrappedSocket.onopen = this.onopen;
                        this.wrappedSocket.onmessage = this.onmessage;
                        this.wrappedSocket.onerror = this.onerror;
                        this.wrappedSocket.onclose = this.onclose;
                    },
                };
                websockets.push(mockWebSocket);
                return mockWebSocket;
            });
        });
    });

    it('M18682-RHS fetches messages on socket reconnect when a different channel is in center', () => {
        // # Connect all sockets
        websockets.map((value) => {
            value.connect();
        });

        // # Post a message as another user
        cy.postMessageAs({sender: users['user-1'], message: "abc", channelId: townsquareChannelId}).wait(TIMEOUTS.SMALL);

        // # Click "Reply"
        cy.getLastPostId().then((rootPostId) => {
            cy.clickPostCommentIcon(rootPostId);

            // # Post a message
            cy.postMessageReplyInRHS('def');

            // # Save our post for later use
            cy.getLastPostIdRHS().as('myPostId');

            // # Change channel
            cy.get('#sidebarItem_suscipit-4').click({force: true}).then(() => {
                // # Close all sockets
                websockets.map((value) => {
                    if (value.close) value.close();
                });

                // # Post message as a different user
                cy.postMessageAs({sender: users['user-1'], message: 'ghi', channelId: townsquareChannelId, rootId: rootPostId});

                // # Wait a short time to check whether the message appears or not
                cy.wait(TIMEOUTS.SMALL);

                // # Get last post Id
                cy.getLastPostIdRHS().then((lastPostId) => {
                    // * Should be the same post as before
                    cy.get('@myPostId').should('equal', lastPostId);

                    // * Should exist in the RHS
                    cy.get(`#rhsPost_${lastPostId}`).should('exist');

                    // * Connect all sockets one more time
                    websockets.map((value) => {
                        value.connect();
                    });

                    // # Wait for sockets to be connected
                    cy.wait(TIMEOUTS.MEDIUM);

                    // # Get last post Id
                    cy.getLastPostIdRHS().then((lastPostId) => {
                        // * Should be different Id as before
                        cy.get('@myPostId').should('not.equal', lastPostId);

                        // * Should exist in RHS
                        cy.get(`#rhsPost_${lastPostId}`).should('exist');
                    });
                });
            });
        });
    });
});
