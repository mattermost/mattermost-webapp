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

import {verifyPostNextToNewMessageSeparator, switchToChannel, showCursor, notShowCursor} from './helpers';

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

    it('Should be able to mark channel as unread by alt-clicking', () => {
        switchToChannel(channelA);

        markAsUnreadFromPost(post2);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post2');

        markAsUnreadFromPost(post1);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post1');

        markAsUnreadFromPost(post3);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post3');
    });

    it('Should be able to mark channel as unread from post menu', () => {
        switchToChannel(channelA);

        // # Mark post2 as unread
        cy.uiClickPostDropdownMenu(post2.id, 'Mark as Unread');

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post2');

        // # Mark post1 as unread
        cy.uiClickPostDropdownMenu(post1.id, 'Mark as Unread');

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post1');

        // # Mark post3 as unread
        cy.uiClickPostDropdownMenu(post3.id, 'Mark as Unread');

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post3');
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

    it('Should be able to mark channel as unread from RHS post menu', () => {
        switchToChannel(channelA);

        // Show the RHS
        cy.get(`#CENTER_commentIcon_${post3.id}`).click({force: true});

        // # Mark post1 as unread in RHS as root thread
        cy.uiClickPostDropdownMenu(post1.id, 'Mark as Unread', 'RHS_ROOT');

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post1');

        // # Mark post3 as unread in RHS as comment
        cy.uiClickPostDropdownMenu(post3.id, 'Mark as Unread', 'RHS_COMMENT');

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

        // Should not show when moused over without holding alt
        for (const componentId of componentIds) {
            cy.get(componentId).should(notShowCursor);
        }

        cy.get('body').trigger('keydown', {altKey: true});

        // Should show when holding alt
        for (const componentId of componentIds) {
            cy.get(componentId).should(showCursor);
        }

        cy.get('body').trigger('keyup', {altKey: false});

        // Should not show after having released alt
        for (const componentId of componentIds) {
            cy.get(componentId).trigger('mouseover');
            cy.get(componentId).should(notShowCursor);
            cy.get(componentId).trigger('mouseout');
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

    it('MM-T250 Mark as unread in the RHS', () => {
        switchToChannel(channelA);

        // # Open RHS (reply thread)
        cy.clickPostCommentIcon(post1.id);

        // # Mark the post as unread from RHS
        cy.uiClickPostDropdownMenu(post1.id, 'Mark as Unread', 'RHS_ROOT');

        // * Verify the New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post1');

        // * Verify the channelA has unread in LHS
        cy.get(`#sidebarItem_${channelA.name}`).should(beUnread);

        // * Verify the RHS does not have the NotificationSeparator line
        cy.get('#rhsContainer').find('.NotificationSeparator').should('not.exist');

        // # Switch to channelB
        switchToChannel(channelB);

        // # Switch to channelA
        switchToChannel(channelA);

        // * Verify the channelA does not have unread in LHS
        cy.get(`#sidebarItem_${channelA.name}`).should(beRead);

        // * Hover on the post with holding alt should show cursor
        cy.get(`#post_${post2.id}`).trigger('mouseover').type('{alt}', {release: false}).should(showCursor);

        // # Mouse click on the post holding alt
        cy.get(`#post_${post2.id}`).type('{alt}', {release: false}).click();

        // * Verify the post is marked as unread
        verifyPostNextToNewMessageSeparator('post2');

        // * Verify the channelA has unread in LHS
        cy.get(`#sidebarItem_${channelA.name}`).should(beUnread);

        // * Verify the RHS does not have the NotificationSeparator line
        cy.get('#rhsContainer').find('.NotificationSeparator').should('not.exist');

        // # Switch to channelB
        switchToChannel(channelB);

        // # Switch to channelA
        switchToChannel(channelA);

        // * Verify the channelA does not have unread in LHS
        cy.get(`#sidebarItem_${channelA.name}`).should(beRead);
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
