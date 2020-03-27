// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import users from '../../fixtures/users.json';
import TIMEOUTS from '../../fixtures/timeouts';

const user1 = users['user-1'];
const sysadmin = users.sysadmin;

describe('Mark as Unread', () => {
    let sysadminId;
    let testTeam;

    let testChannelA;
    let testChannelB;

    let post1;
    let post2;
    let post3;

    beforeEach(() => {
        // # Login as user-1
        cy.apiLogin('user-1');

        // # Create a team and add sysadmin into it
        cy.apiCreateTeam('test-team', 'Test Team').then((teamRes) => {
            testTeam = teamRes.body;
            cy.apiGetUserByEmail(sysadmin.email).then((emailResponse) => {
                sysadminId = emailResponse.body.id;
                cy.apiAddUserToTeam(testTeam.id, sysadminId);
            });

            // # Create Channel A
            cy.apiCreateChannel(testTeam.id, 'channel-a', 'Channel A').then((resp) => {
                testChannelA = resp.body;

                // # Add sysadmin to channel A
                cy.apiAddUserToChannel(testChannelA.id, sysadminId);

                // Another user creates posts in the channel since you can't mark your own posts unread currently
                cy.postMessageAs({sender: sysadmin, message: 'post1', channelId: testChannelA.id}).then((p1) => {
                    post1 = p1;

                    cy.postMessageAs({sender: sysadmin, message: 'post2', channelId: testChannelA.id}).then((p2) => {
                        post2 = p2;

                        cy.postMessageAs({sender: sysadmin, message: 'post3', channelId: testChannelA.id, rootId: post1.id}).then((post) => {
                            post3 = post;
                        });
                    });
                });
            });

            // # Create Channel B
            cy.apiCreateChannel(testTeam.id, 'channel-b', 'Channel B').then((resp) => {
                testChannelB = resp.body;
            });

            // # Visit the Town Square channel
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    afterEach(() => {
        if (testChannelA && testChannelA.id) {
            cy.apiDeleteChannel(testChannelA.id);
        }
        if (testChannelB && testChannelB.id) {
            cy.apiDeleteChannel(testChannelB.id);
        }
        if (testTeam && testTeam.id) {
            cy.apiDeleteTeam(testTeam.id);
        }
    });

    it('Channel should appear unread after switching away from channel and be read after switching back', () => {
        // Starts unread
        cy.get(`#sidebarItem_${testChannelA.name}`).should(beUnread);

        switchToChannel(testChannelA);

        // Then becomes read when you view the channel
        cy.get(`#sidebarItem_${testChannelA.name}`).should(beRead);

        markAsUnreadFromPost(post2);

        // Then becomes unread when the channel is marked as unread
        cy.get(`#sidebarItem_${testChannelA.name}`).should(beUnread);

        switchToChannel(testChannelB);

        // Then stays unread when switching away
        cy.get(`#sidebarItem_${testChannelA.name}`).should(beUnread);

        switchToChannel(testChannelA);

        // And becomes read when switching back
        cy.get(`#sidebarItem_${testChannelA.name}`).should(beRead);
    });

    it('New messages line should remain after switching back to channel', () => {
        switchToChannel(testChannelA);

        // Starts not visible
        cy.get('.NotificationSeparator').should('not.exist');

        markAsUnreadFromPost(post2);

        // Then becomes visible
        cy.get('.NotificationSeparator').should('exist');

        switchToChannel(testChannelB);
        switchToChannel(testChannelA);

        // Then stays visible when switching back to channel
        cy.get('.NotificationSeparator').should('exist');

        switchToChannel(testChannelB);
        switchToChannel(testChannelA);

        // Then finally disappears when switching back a second time
        cy.get('.NotificationSeparator').should('not.exist');
    });

    it('Should be able to mark channel as unread by alt-clicking', () => {
        switchToChannel(testChannelA);

        markAsUnreadFromPost(post2);

        // The New Messages line should appear above the selected post
        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post2');

        markAsUnreadFromPost(post1);

        // The New Messages line should appear above the selected post
        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post1');

        markAsUnreadFromPost(post3);

        // The New Messages line should appear above the selected post
        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post3');
    });

    it('Should be able to mark channel as unread from post menu', () => {
        switchToChannel(testChannelA);

        markAsUnreadFromMenu(post2);

        // The New Messages line should appear above the selected post
        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post2');

        markAsUnreadFromMenu(post1);

        // The New Messages line should appear above the selected post
        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post1');

        markAsUnreadFromMenu(post3);

        // The New Messages line should appear above the selected post
        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post3');
    });

    it('Should be able to mark channel as unread by alt-clicking on RHS', () => {
        switchToChannel(testChannelA);

        // Show the RHS
        cy.get(`#CENTER_commentIcon_${post3.id}`).click({force: true});

        markAsUnreadFromPost(post1, true);

        // The New Messages line should appear above the selected post
        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post1');

        markAsUnreadFromPost(post3, true);

        // The New Messages line should appear above the selected post
        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post3');
    });

    it('Should be able to mark channel as unread from RHS post menu', () => {
        switchToChannel(testChannelA);

        // Show the RHS
        cy.get(`#CENTER_commentIcon_${post3.id}`).click({force: true});

        markAsUnreadFromMenu(post1, true);

        // The New Messages line should appear above the selected post
        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post1');

        markAsUnreadFromMenu(post3, true);

        // The New Messages line should appear above the selected post
        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post3');
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

        switchToChannel(testChannelA);

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
        switchToChannel(testChannelA);

        cy.get(`#sidebarItem_${testChannelA.name}`).should(beRead);

        markAsUnreadFromAnotherSession(post2);

        // The channel should now be unread
        cy.get(`#sidebarItem_${testChannelA.name}`).should(beUnread);

        // The New Messages line should appear above the selected post
        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post2');

        switchToChannel(testChannelB);

        // Then stays unread when switching away
        cy.get(`#sidebarItem_${testChannelA.name}`).should(beUnread);

        switchToChannel(testChannelA);

        // And becomes read when switching back
        cy.get(`#sidebarItem_${testChannelA.name}`).should(beRead);

        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post2');
    });

    it('Marking a channel as unread from another session while viewing another channel', () => {
        switchToChannel(testChannelA);
        switchToChannel(testChannelB);

        cy.get(`#sidebarItem_${testChannelA.name}`).should(beRead);

        markAsUnreadFromAnotherSession(post2);

        // The channel should now be unread
        cy.get(`#sidebarItem_${testChannelA.name}`).should(beUnread);

        switchToChannel(testChannelA);

        // And becomes read when switching back
        cy.get(`#sidebarItem_${testChannelA.name}`).should(beRead);

        cy.get('.NotificationSeparator').should('exist');
        cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post2');
    });
});

function switchToChannel(channel) {
    cy.get(`#sidebarItem_${channel.name}`).click();

    cy.get('#channelHeaderTitle').should('contain', channel.display_name);

    // # Wait some time for the channel to set state
    cy.wait(TIMEOUTS.TINY);
}

function beRead(items) {
    expect(items).to.have.length(1);
    expect(items[0].className).to.not.match(/unread-title/);
}

function beUnread(items) {
    expect(items).to.have.length(1);
    expect(items[0].className).to.match(/unread-title/);
}

function markAsUnreadFromMenu(post, rhs = false) {
    const prefix = rhs ? 'rhsPost' : 'post';

    cy.get(`#${prefix}_${post.id}`).trigger('mouseover');
    cy.get(`#${prefix}_${post.id} .post__dropdown`).click({force: true});
    cy.get(`#${prefix}_${post.id} #unread_post_${post.id}`).click();
}

function markAsUnreadFromPost(post, rhs = false) {
    const prefix = rhs ? 'rhsPost' : 'post';

    cy.get('body').type('{alt}', {release: false});
    cy.get(`#${prefix}_${post.id}`).click();
    cy.get('body').type('{alt}', {release: true});
}

function markAsUnreadFromAnotherSession(post) {
    cy.getCurrentUserId().then((userId) => {
        cy.externalRequest({
            user: user1,
            method: 'post',
            path: `users/${userId}/posts/${post.id}/set_unread`,
        });
    });
}
