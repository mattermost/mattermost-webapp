// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @notifications

import {spyNotificationAs} from '../../support/notification';

function setReplyNotificationsSetting(idToToggle) {
    // Navigate to settings modal
    cy.toAccountSettingsModal();

    // Select "Notifications"
    cy.get('#notificationsButton').click();

    // Notifications header should be visible
    cy.get('#notificationSettingsTitle').
        scrollIntoView().
        should('be.visible').
        and('contain', 'Notifications');

    // Open up 'Reply Notifications' sub-section
    cy.get('#commentsTitle').
        scrollIntoView().
        click();

    cy.get(idToToggle).check().should('be.checked');

    // Click “Save” and close modal
    cy.get('#saveSetting').
        scrollIntoView().
        click();
    cy.get('#accountSettingsHeader > .close').
        click().
        should('not.exist');
}

describe('reply-notifications', () => {
    let testTeam;
    let otherChannel;
    let townsquareChannelId;
    let receiver;
    let sender;

    before(() => {
        // # Update Configs
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelOrganization: true,
            },
        });

        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            otherChannel = channel;
            receiver = user;

            cy.apiCreateUser().then(({user: user1}) => {
                sender = user1;

                cy.apiAddUserToTeam(testTeam.id, sender.id);
            });

            cy.apiGetChannelByName(testTeam.name, 'town-square').then((out) => {
                townsquareChannelId = out.channel.id;
            });

            // # Login as receiver and visit town-square channel
            cy.apiLogin(receiver);
        });
    });

    it('MM-T551 Do not trigger notifications on messages in reply threads unless I\'m mentioned', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // Setup notification spy
        spyNotificationAs('notifySpy', 'granted');

        // # Set users notification settings
        setReplyNotificationsSetting('#notificationCommentsNever');

        // # Navigate to town square channel
        cy.get(`#sidebarItem_${'town-square'}`).click({force: true});

        // # Post a message
        cy.postMessage('Hi there, this is a root message');

        // # Get post id of message
        cy.getLastPostId().then((postId) => {
            // # Switch to other channel so that unread notifications in 'town-square` may be triggered
            cy.get(`#sidebarItem_${otherChannel.name}`).click({force: true});

            // # Post a message in original thread as another user
            cy.postMessageAs({sender, message: 'This is a reply to the root post', channelId: townsquareChannelId, rootId: postId});

            // * Verify stub was not called
            cy.get('@notifySpy').should('be.not.called');

            // * Verify unread mentions badge does not exist
            cy.get('#sidebarItem_town-square').find('#unreadMentions').should('be.not.visible');

            // # Switch again to other channel
            cy.get(`#sidebarItem_${otherChannel.name}`).click({force: true});

            // # Reply to a post as another user mentioning the receiver
            cy.postMessageAs({sender, message: `Another reply with mention @${receiver.username}`, channelId: townsquareChannelId, rootId: postId});

            // * Verify stub was called
            cy.get('@notifySpy').should('be.called');

            // * Verify unread mentions badge exists
            cy.get('#sidebarItem_town-square').find('#unreadMentions').should('be.visible');
        });
    });

    it('MM-T552 Trigger notifications on messages in threads that I start', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // Setup notification spy
        spyNotificationAs('notifySpy', 'granted');

        // # Navigate to town square channel
        cy.get(`#sidebarItem_${'town-square'}`).click({force: true});

        // # Set users notification settings
        setReplyNotificationsSetting('#notificationCommentsRoot');

        // # Post a message
        cy.postMessage('Hi there, this is another root message');

        // # Get post id of message
        cy.getLastPostId().then((postId) => {
            // # Switch to other channel so that unread notifications in 'town-square` may be triggered
            cy.get(`#sidebarItem_${otherChannel.name}`).click({force: true});

            // # Post a message in original thread as another user
            const message = 'This is a reply to the root post';
            cy.postMessageAs({sender, message, channelId: townsquareChannelId, rootId: postId}).then(() => {
                // * Verify stub was called
                cy.get('@notifySpy').should('be.called');

                // * Verify unread mentions badge exists
                cy.get('#sidebarItem_town-square').find('#unreadMentions').should('be.visible');

                // # Navigate to town square channel
                cy.get(`#sidebarItem_${'town-square'}`).click({force: true});

                // * Verify entire message
                cy.getLastPostId().then((msgId) => {
                    cy.get(`#postMessageText_${msgId}`).as('postMessageText');

                    // * Verify reply bar highlight
                    cy.get(`#${msgId}_message`).should('have.class', 'mention-comment');
                });
                cy.get('@postMessageText').
                    should('be.visible').
                    and('have.text', message);
            });
        });
    });

    it('MM-T553 Trigger notifications on messages in reply threads that I start or participate in - start thread', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // Setup notification spy
        spyNotificationAs('notifySpy', 'granted');

        // # Set users notification settings
        setReplyNotificationsSetting('#notificationCommentsAny');

        // # Post a message
        cy.postMessage('Hi there, this is another root message');

        // # Get post id of message
        cy.getLastPostId().then((postId) => {
            // # Switch to other channel so that unread notifications in 'town-square` may be triggered
            cy.get(`#sidebarItem_${otherChannel.name}`).click({force: true});

            // # Post a message in original thread as another user
            const message = 'This is a reply to the root post';
            cy.postMessageAs({sender, message, channelId: townsquareChannelId, rootId: postId}).then(() => {
                // * Verify stub was called
                cy.get('@notifySpy').should('be.called');

                // * Verify unread mentions badge exists
                cy.get('#sidebarItem_town-square').find('#unreadMentions').should('be.visible');

                // # Navigate to town square channel
                cy.get(`#sidebarItem_${'town-square'}`).click({force: true});

                // * Verify entire message
                cy.getLastPostId().then((msgId) => {
                    cy.get(`#postMessageText_${msgId}`).as('postMessageText');

                    // * Verify reply bar highlight
                    cy.get(`#${msgId}_message`).should('have.class', 'mention-comment');
                });
                cy.get('@postMessageText').
                    should('be.visible').
                    and('have.text', message);
            });
        });
    });

    it('MM-T554 Trigger notifications on messages in reply threads that I start or participate in - participate in', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // Setup notification spy
        spyNotificationAs('notifySpy', 'granted');

        // # Set users notification settings
        setReplyNotificationsSetting('#notificationCommentsAny');

        // # Make a root post as some other user
        const rootPostMessage = 'a root message by some other user';
        cy.postMessageAs({sender, message: rootPostMessage, channelId: townsquareChannelId}).then((post) => {
            const rootPostId = post.id;
            const rootPostMessageId = `#rhsPostMessageText_${rootPostId}`;

            // # Click comment icon to open RHS
            cy.clickPostCommentIcon(rootPostId);

            // * Check that the RHS is open
            cy.get('#rhsContainer').should('be.visible');

            // * Verify that the original message is in the RHS
            cy.get('#rhsContainer').find(rootPostMessageId).should('have.text', `${rootPostMessage}`);

            // # Post a reply as receiver, i.e. participate in the thread
            cy.postMessageReplyInRHS('this is a reply from the receiver');

            // # Wait till receiver's post is visible
            cy.getLastPostId().then(() => {
                // # Switch to other channel so that unread notifications in 'town-square` may be triggered
                cy.get(`#sidebarItem_${otherChannel.name}`).click({force: true});

                // # Post a message in thread as another user
                const message = 'This is a reply by sender';
                cy.postMessageAs({sender, message, channelId: townsquareChannelId, rootId: rootPostId}).then(() => {
                    // * Verify stub was called
                    cy.get('@notifySpy').should('be.called');

                    // * Verify unread mentions badge exists
                    cy.get('#sidebarItem_town-square').find('#unreadMentions').should('be.visible');

                    // # Navigate to town square channel
                    cy.get(`#sidebarItem_${'town-square'}`).click({force: true});

                    cy.getLastPostId().then((msgId) => {
                        // * Verify entire message
                        cy.get(`#postMessageText_${msgId}`).
                            should('be.visible').
                            and('have.text', message);

                        // * Verify reply bar highlight
                        cy.get(`#${msgId}_message`).should('have.class', 'mention-comment');
                    });
                });
            });
        });
    });
});
