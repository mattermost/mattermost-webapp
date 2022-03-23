// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @mark_as_unread

import {beRead, beUnread} from '../../support/assertions';

import {verifyPostNextToNewMessageSeparator, verifyTopSpaceForNewMessage, verifyBottomSpaceForNewMessage, switchToChannel, showCursor, notShowCursor} from './helpers';

describe('Mark as Unread', () => {
    let testUser;

    let channelA;
    let channelB;

    let post1;
    let post2;
    let post3;

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.apiInitSetup().then(({team, channel, user}) => {
            testUser = user;
            channelA = channel;

            cy.apiCreateChannel(team.id, 'channel-b', 'Channel B').then((out) => {
                channelB = out.channel;
                cy.apiAddUserToChannel(channelB.id, testUser.id);
            });

            cy.apiCreateUser().then(({user: user2}) => {
                const otherUser = user2;

                cy.apiAddUserToTeam(team.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(channelA.id, otherUser.id);

                    // Another user creates posts in the channel since you can't mark your own posts unread currently
                    cy.postMessageAs({
                        sender: otherUser,
                        message: 'post1',
                        channelId: channelA.id,
                    }).then((p1) => {
                        post1 = p1;

                        cy.postMessageAs({
                            sender: otherUser,
                            message: 'post2',
                            channelId: channelA.id,
                        }).then((p2) => {
                            post2 = p2;

                            cy.postMessageAs({
                                sender: otherUser,
                                message: 'post3',
                                channelId: channelA.id,
                                rootId: post1.id,
                            }).then((post) => {
                                post3 = post;
                            });
                        });
                    });
                });
            });

            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('Channel should appear unread after switching away from channel and be read after switching back', () => {
        // Starts unread
        cy.get(`#sidebarItem_${channelA.name}`).should(beUnread);

        switchToChannel(channelA);

        // Then becomes read when you view the channel
        cy.get(`#sidebarItem_${channelA.name}`).should(beRead);

        markAsUnreadFromPost(post2);

        // Then becomes unread when the channel is marked as unread
        cy.get(`#sidebarItem_${channelA.name}`).should(beUnread);

        switchToChannel(channelB);

        // Then stays unread when switching away
        cy.get(`#sidebarItem_${channelA.name}`).should(beUnread);

        switchToChannel(channelA);

        // And becomes read when switching back
        cy.get(`#sidebarItem_${channelA.name}`).should(beRead);
    });

    it('New messages line should remain after switching back to channel', () => {
        switchToChannel(channelA);

        // Starts not visible
        cy.get('.NotificationSeparator').should('not.exist');

        markAsUnreadFromPost(post2);

        // Then becomes visible
        cy.get('.NotificationSeparator').should('exist');

        switchToChannel(channelB);
        switchToChannel(channelA);

        // Then stays visible when switching back to channel
        cy.get('.NotificationSeparator').should('exist');

        switchToChannel(channelB);
        switchToChannel(channelA);

        // Then finally disappears when switching back a second time
        cy.get('.NotificationSeparator').should('not.exist');
    });

    it('MM-T260 Mark as Unread New Messages line extra space moves with it', () => {
        switchToChannel(channelA);

        markAsUnreadFromPost(post2);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post2');

        // Top separator space should appear above the selected post
        verifyTopSpaceForNewMessage('post2');

        // Bottom separator space should appear below the post
        verifyBottomSpaceForNewMessage('post1');

        markAsUnreadFromPost(post1);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post1');

        // Top separator space should appear above the selected post
        verifyTopSpaceForNewMessage('post1');

        // Bottom separator space should appear below the post by user
        verifyBottomSpaceForNewMessage('System');

        markAsUnreadFromPost(post3);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post3');

        // Top separator space should appear above the selected post
        verifyTopSpaceForNewMessage('post3');

        // Bottom separator space should appear below the post
        verifyBottomSpaceForNewMessage('post2');
    });

    it('Should be able to mark channel as unread by alt-clicking on RHS', () => {
        switchToChannel(channelA);

        // Show the RHS
        cy.get(`#CENTER_commentIcon_${post3.id}`).click({force: true});

        markAsUnreadFromPost(post1, true);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post1');

        markAsUnreadFromPost(post3, true);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post3');
    });

    it('Should show cursor pointer when holding down alt', () => {
        const componentIds = [
            `#post_${post1.id}`,
            `#post_${post2.id}`,
            `#post_${post3.id}`,
            `#rhsPost_${post1.id}`,
            `#rhsPost_${post3.id}`,
        ];

        switchToChannel(channelA);

        // Show the RHS
        cy.get(`#CENTER_commentIcon_${post3.id}`).click({force: true});

        // Pretend that we start hovering over each and then hold alt afterwards
        for (const componentId of componentIds) {
            // * Verify that we don't show the pointer on mouseover
            cy.get(componentId).trigger('mouseover').should(notShowCursor);

            // * Verify that we show the pointer after pressing alt
            cy.get(componentId).trigger('keydown', {altKey: true}).should(showCursor);

            // * Verify that we stop showing the pointer after releasing alt
            cy.get(componentId).trigger('keydown', {altKey: false}).should(notShowCursor);

            // # Move the mouse away from the post
            cy.get(componentId).trigger('mouseout');
        }

        // Pretend that we hold down alt and then hover over each post
        for (const componentId of componentIds) {
            // * Verify that we don't show the pointer on mouseover
            cy.get(componentId).trigger('mouseover', {altKey: true}).should(showCursor);

            // # Move the mouse away from the post
            cy.get(componentId).trigger('mouseout', {altKey: true}).should(notShowCursor);
        }
    });

    it('Marking a channel as unread from another session while viewing channel', () => {
        switchToChannel(channelA);

        cy.get(`#sidebarItem_${channelA.name}`).should(beRead);

        markAsUnreadFromAnotherSession(post2, testUser);

        // The channel should now be unread
        cy.get(`#sidebarItem_${channelA.name}`).should(beUnread);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post2');

        switchToChannel(channelB);

        // Then stays unread when switching away
        cy.get(`#sidebarItem_${channelA.name}`).should(beUnread);

        switchToChannel(channelA);

        // And becomes read when switching back
        cy.get(`#sidebarItem_${channelA.name}`).should(beRead);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post2');
    });

    it('Marking a channel as unread from another session while viewing another channel', () => {
        switchToChannel(channelA);
        switchToChannel(channelB);

        cy.get(`#sidebarItem_${channelA.name}`).should(beRead);

        markAsUnreadFromAnotherSession(post2, testUser);

        // The channel should now be unread
        cy.get(`#sidebarItem_${channelA.name}`).should(beUnread);

        switchToChannel(channelA);

        // And becomes read when switching back
        cy.get(`#sidebarItem_${channelA.name}`).should(beRead);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post2');
    });
});

function markAsUnreadFromPost(post, rhs = false) {
    const prefix = rhs ? 'rhsPost' : 'post';

    cy.get('body').type('{alt}', {release: false});
    cy.get(`#${prefix}_${post.id}`).click({force: true});
    cy.get('body').type('{alt}', {release: true});
}

function markAsUnreadFromAnotherSession(post, user) {
    cy.externalRequest({
        user,
        method: 'post',
        path: `users/${user.id}/posts/${post.id}/set_unread`,
    });
}
