// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @mark_as_unread

import {beRead, beUnread} from '../../support/assertions';

import {verifyPostNextToNewMessageSeparator, switchToChannel, showCursor} from './helpers';

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

    it('Should be able to mark channel as unread from post menu -- KNOWN ISSUE: MM-42636', () => {
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

    it('Should be able to mark channel as unread from RHS post menu -- KNOWN ISSUE: MM-42636', () => {
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

    it('MM-T250 Mark as unread in the RHS -- KNOWN ISSUE: MM-42636', () => {
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
