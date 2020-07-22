// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @mark_as_unread

import * as TIMEOUTS from '../../fixtures/timeouts';

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

            cy.apiCreateChannel(team.id, 'channel-b', 'Channel B').then((resp) => {
                channelB = resp.body;
                cy.apiAddUserToChannel(channelB.id, testUser.id);
            });

            cy.apiCreateUser().then(({user: user2}) => {
                const otherUser = user2;

                cy.apiAddUserToTeam(team.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(channelA.id, otherUser.id);

                    // Another user creates posts in the channel since you can't mark your own posts unread currently
                    cy.postMessageAs({sender: otherUser, message: 'post1', channelId: channelA.id}).then((p1) => {
                        post1 = p1;

                        cy.postMessageAs({sender: otherUser, message: 'post2', channelId: channelA.id}).then((p2) => {
                            post2 = p2;

                            cy.postMessageAs({sender: otherUser, message: 'post3', channelId: channelA.id, rootId: post1.id}).then((post) => {
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

        markAsUnreadFromMenu(post2);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post2');

        markAsUnreadFromMenu(post1);

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post1');

        markAsUnreadFromMenu(post3);

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

        markAsUnreadFromMenu(post1, 'rhsPost', 'RHS_ROOT');

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post1');

        markAsUnreadFromMenu(post3, 'rhsPost', 'RHS_COMMENT');

        // The New Messages line should appear above the selected post
        verifyPostNextToNewMessageSeparator('post3');
    });

    it('Should show cursor pointer when holding down alt', () => {
        const showCursor = (items) => {
            cy.expect(items).to.have.length(1);
            expect(items[0].className).to.match(/cursor--pointer/);
        };

        const notShowCursor = (items) => {
            cy.expect(items).to.have.length(1);
            expect(items[0].className).to.not.match(/cursor--pointer/);
        };

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
});

function switchToChannel(channel) {
    cy.get(`#sidebarItem_${channel.name}`).click();

    cy.get('#channelHeaderTitle').should('contain', channel.display_name);

    // # Wait some time for the channel to set state
    cy.wait(TIMEOUTS.HALF_SEC);
}

function beRead(items) {
    expect(items).to.have.length(1);
    expect(items[0].className).to.not.match(/unread-title/);
}

function beUnread(items) {
    expect(items).to.have.length(1);
    expect(items[0].className).to.match(/unread-title/);
}

function markAsUnreadFromMenu(post, prefix = 'post', location = 'CENTER') {
    cy.get(`#${prefix}_${post.id}`).trigger('mouseover');
    cy.clickPostDotMenu(post.id, location);
    cy.get('.dropdown-menu').should('be.visible').within(() => {
        cy.findByText('Mark as Unread').should('be.visible').click();
    });
}

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

function verifyPostNextToNewMessageSeparator(message) {
    cy.get('.NotificationSeparator').should('exist').parent().parent().parent().next().should('contain', message);
}
