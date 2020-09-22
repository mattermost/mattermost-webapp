// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Messaging', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let userOne;

    before(() => {
        // # Wrap websocket to be able to connect and close connections on demand
        cy.mockWebsockets();

        // # Login as test user and go to town-square
        cy.apiInitSetup().then(({team, channel, user}) => {
            testUser = user;
            testTeam = team;
            testChannel = channel;

            cy.apiCreateUser().then(({user: user1}) => {
                userOne = user1;
                cy.apiAddUserToTeam(testTeam.id, userOne.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, userOne.id);
                });
            });

            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        });
    });

    it('MM-T94 RHS fetches messages on socket reconnect when a different channel is in center', () => {
        // # Connect all sockets
        window.mockWebsockets.forEach((value) => {
            value.connect();
        });

        // # Post a message as another user
        cy.postMessageAs({sender: userOne, message: 'abc', channelId: testChannel.id}).wait(TIMEOUTS.FIVE_SEC);

        // # Click "Reply"
        cy.getLastPostId().then((rootPostId) => {
            cy.clickPostCommentIcon(rootPostId);

            // # Post a message
            cy.postMessageReplyInRHS('def');

            // # Change channel
            cy.get('#sidebarItem_town-square').click({force: true}).then(() => {
                // # Close all sockets
                window.mockWebsockets.forEach((value) => {
                    if (value.close) {
                        value.close();
                    }
                });

                // # Post message as a different user
                cy.postMessageAs({sender: userOne, message: 'ghi', channelId: testChannel.id, rootId: rootPostId});

                // # Wait a short time to check whether the message appears or not
                cy.wait(TIMEOUTS.FIVE_SEC);

                // * Verify that only "def" is posted and not "ghi"
                cy.get('#rhsPostList').should('be.visible').children().should('have.length', 1);
                cy.get('#rhsPostList').within(() => {
                    cy.findByText('def').should('be.visible');
                    cy.findByText('ghi').should('not.exist');
                }).then(() => {
                    // * Connect all sockets one more time
                    window.mockWebsockets.forEach((value) => {
                        value.connect();
                    });

                    // # Wait for sockets to be connected
                    cy.wait(TIMEOUTS.TEN_SEC);

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
