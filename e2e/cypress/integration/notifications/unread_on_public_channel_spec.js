// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @notifications

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Notifications', () => {
    let testUser;
    let otherUser;
    let testTeam;
    let testChannel;

    beforeEach(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            cy.apiCreateUser().then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id);
            });

            cy.apiLogin(testUser).then(() => {
                // # Create new test channel
                cy.apiCreateChannel(testTeam.id, 'channel-test', 'Channel').then((channelRes) => {
                    testChannel = channelRes.body;

                    cy.apiAddUserToChannel(channelRes.body.id, otherUser.id);

                    // # Create more channels for scrolling in LHS
                    Cypress._.times(40, (i) => {
                        cy.apiCreateChannel(testTeam.id, `channel-test-${i}`, `channel-${i}`).then((channelResponse) => {
                            cy.apiAddUserToChannel(channelResponse.body.id, otherUser.id);
                        });
                    });

                    // # Most page of messages so the channel can be scrolled up
                    Cypress._.times(40, (i) => {
                        cy.postMessageAs({sender: testUser, message: `test${i}`, channelId: testChannel.id});
                    });

                    // # Go to test channel
                    cy.visit(`/${team.name}/channels/${testChannel.name}`);

                    // # Scroll above the last few messages
                    cy.get('div.post-list__dynamic', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').
                        scrollTo(0, '70%', {duration: TIMEOUTS.ONE_SEC}).
                        wait(TIMEOUTS.ONE_SEC);

                    // # scroll to the last channel
                    cy.get('#lhsList li').last().scrollIntoView();
                });
            });
        });
    });

    it('MM-T563 New message bar - Reply posted while scrolled up in same channel', () => {
        // # Login as other user
        cy.apiLogin(otherUser);

        // # Get last post and reply a message
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
            const replyMessage = 'A reply to an older post';
            cy.postMessageReplyInRHS(replyMessage);
        });

        // # Login as test user
        cy.apiLogin(testUser);

        // * Verify the toast is visible with correct message
        cy.get('div.toast').should('be.visible').contains('1 new message');
    });
});
