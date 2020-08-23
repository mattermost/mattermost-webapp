// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel

import * as TIMEOUTS from '../../fixtures/timeouts';

import {markAsUnreadByPostIdFromMenu, verifyPostNextToNewMessageSeparator, beRead, beUnread} from './helpers';

describe('channel unread posts', () => {
    let testUser;
    let otherUser;

    let channelA;
    let channelB;

    beforeEach(() => {
        // # Create testUser added to channel
        cy.apiInitSetup().then(({team, channel, user}) => {
            testUser = user;
            channelA = channel;

            // # Create second channel and add testUser
            cy.apiCreateChannel(team.id, 'channel-b', 'Channel B').then((resp) => {
                channelB = resp.body;
                cy.apiAddUserToChannel(channelB.id, testUser.id);
            });

            // # Create otherUser, add to team, and add to both channelA and channelB
            cy.apiCreateUser().then(({user: user2}) => {
                otherUser = user2;

                cy.apiAddUserToTeam(team.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(channelA.id, otherUser.id);
                    cy.apiAddUserToChannel(channelB.id, otherUser.id);
                });

                for (let index = 0; index < 5; index++) {
                    // # Post Message as Current user
                    const message = `hello from current user: ${index}`;

                    cy.postMessageAs({sender: testUser, message, channelId: channelA.id});
                }
            });

            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T246 Mark Post as Unread', () => {
        // # Login as other user
        cy.apiLogin(otherUser);

        // # Switch to channelA
        switchToChannel(channelA);

        // # Mark the last post as unread
        cy.getLastPostId().then((postId) => {
            markAsUnreadByPostIdFromMenu(postId);
        });

        // * Verify the notification separator line exists and present before the unread message
        verifyPostNextToNewMessageSeparator('hello from current user: 4');

        // # Switch to channelB
        switchToChannel(channelB);

        // * Verify the channelA has unread in LHS
        cy.get(`#sidebarItem_${channelA.name}`).should(beUnread);

        // # Switch to channelA
        switchToChannel(channelA);

        // * Verify the channelA has does not have unread in LHS
        cy.get(`#sidebarItem_${channelA.name}`).should(beRead);

        // * Verify the notification separator line exists and present before the unread message
        verifyPostNextToNewMessageSeparator('hello from current user: 4');

        // # Switch to channelB
        switchToChannel(channelB);

        // * Verify the channelA has does not have unread in LHS
        cy.get(`#sidebarItem_${channelA.name}`).should(beRead);
    });
});

function switchToChannel(channel) {
    cy.get(`#sidebarItem_${channel.name}`).click();

    cy.get('#channelHeaderTitle').should('contain', channel.display_name);

    // # Wait some time for the channel to set state
    cy.wait(TIMEOUTS.ONE_SEC);
}

