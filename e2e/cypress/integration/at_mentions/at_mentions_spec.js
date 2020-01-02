// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

function setNotificationSettings(desiredSettings = {first: true, username: true, shouts: true, custom: true, customText: '@'}) {
    // Navigate to settings modal
    cy.toAccountSettingsModal('user-1');

    // Select "Notifications"
    cy.get('#notificationsButton').click();

    // Notifications header should be visible
    cy.get('#notificationSettingsTitle').
        scrollIntoView().
        should('be.visible').
        and('contain', 'Notifications');

    // Open up 'Words that trigger mentions' sub-section
    cy.get('#keysTitle').
        scrollIntoView().
        click();

    const settings = [
        {key: 'first', selector: '#notificationTriggerFirst'},
        {key: 'username', selector: '#notificationTriggerUsername'},
        {key: 'shouts', selector: '#notificationTriggerShouts'},
        {key: 'custom', selector: '#notificationTriggerCustom'},
    ];

    // Set check boxes to desired state
    settings.forEach((setting) => {
        const checkbox = desiredSettings[setting.key] ? {state: 'check', verify: 'be.checked'} : {state: 'uncheck', verify: 'not.be.checked'};
        cy.get(setting.selector)[checkbox.state]().should(checkbox.verify);
    });

    // Set Custom field
    if (desiredSettings.custom && desiredSettings.customText) {
        cy.get('#notificationTriggerCustomText').
            clear().
            type(desiredSettings.customText);
    }

    // Click “Save” and close modal
    cy.get('#saveSetting').
        scrollIntoView().
        click();
    cy.get('#accountSettingsHeader > .close').
        click().
        should('not.exist');

    // Setup notification spy
    cy.window().then((win) => {
        function Notification(title, opts) {
            this.title = title;
            this.opts = opts;
        }

        Notification.requestPermission = function() {
            return 'granted';
        };

        Notification.close = function() {
            return true;
        };

        win.Notification = Notification;

        cy.spy(win, 'Notification').as('notifySpy');
    });

    // Verify that we now have a Notification property
    cy.window().should('have.property', 'Notification');
}

const receiver = users['user-1'];
const sender = users['user-2'];
const sysadmin = users.sysadmin;
let townsquareChannelId;
let offTopicChannelId;

describe('at-mention', () => {
    before(() => {
        // # Login as receiver and go to "/"
        cy.apiLogin(receiver.username);

        // # Navigate to the channel we were mention to
        // clear the notification gem and get the channelId
        cy.visit('/ad-1/channels/town-square');
        cy.getCurrentChannelId().then((id) => {
            townsquareChannelId = id;
        });
        cy.visit('/ad-1/channels/off-topic');
        cy.getCurrentChannelId().then((id) => {
            offTopicChannelId = id;
        });
    });

    beforeEach(() => {
        // # Navigate to a channel we are NOT going to post to
        cy.get('#sidebarItem_saepe-5').scrollIntoView().click({force: true});
    });

    it('N14571 still triggers notification if username is not listed in words that trigger mentions', () => {
        // # Set Notification settings
        setNotificationSettings({first: false, username: true, shouts: true, custom: true});

        const message = `@${receiver.username} I'm messaging you! ${Date.now()}`;

        // # Use another account to post a message @-mentioning our receiver
        cy.postMessageAs({sender, message, channelId: townsquareChannelId});

        const body = `@${sender.username}: ${message}`;

        cy.get('@notifySpy').should('have.been.calledWithMatch',
            'Town Square', {body, tag: body, requireInteraction: false, silent: false});

        // * Verify unread mentions badge
        cy.get('#publicChannel').scrollIntoView();

        cy.get('#sidebarItem_town-square').
            scrollIntoView().
            find('#unreadMentions').
            should('be.visible').
            and('have.text', '1');

        // * Go to that channel
        cy.get('#sidebarItem_town-square').click({force: true});

        // # Get last post message text
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).as('postMessageText');
        });

        // * Verify entire message
        cy.get('@postMessageText').
            should('be.visible').
            and('have.text', message);

        // * Verify highlight of username
        cy.get('@postMessageText').
            find(`[data-mention=${receiver.username}]`).
            should('be.visible').
            and('have.text', `@${receiver.username}`);
    });

    it('N14570 does not trigger notifications with "Your non-case sensitive username" unchecked', () => {
        // # Set Notification settings
        setNotificationSettings({first: false, username: false, shouts: true, custom: true});

        const message = `Hey ${receiver.username}! I'm messaging you! ${Date.now()}`;

        // # Use another account to post a message @-mentioning our receiver
        cy.postMessageAs({sender, message, channelId: townsquareChannelId});

        // * Verify stub was not called
        cy.get('@notifySpy').should('be.not.called');

        // * Verify unread mentions badge does not exist
        cy.get('#publicChannel').scrollIntoView();
        cy.get('#sidebarItem_town-square').
            scrollIntoView().
            find('#unreadMentions').
            should('be.not.visible');

        // # Go to the channel where you were messaged
        cy.get('#sidebarItem_town-square').click({force: true});

        // # Get last post message text
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).as('postMessageText');
        });

        // * Verify message contents
        cy.get('@postMessageText').
            should('be.visible').
            and('have.text', message);

        // * Verify it's not highlighted
        cy.get('@postMessageText').
            find(`[data-mention=${receiver.username}]`).
            should('not.exist');
    });

    it('N14572 does not trigger notifications with "channel-wide mentions" unchecked', () => {
        // # Set Notification settings
        setNotificationSettings({first: false, username: false, shouts: false, custom: true});

        const channelMentions = ['@here', '@all', '@channel'];

        channelMentions.forEach((mention) => {
            const message = `Hey ${mention} I'm message you all! ${Date.now()}`;

            // # Use another account to post a message @-mentioning our receiver
            cy.postMessageAs({sender, message, channelId: townsquareChannelId});

            // * Verify stub was not called
            cy.get('@notifySpy').should('be.not.called');

            // * Verify unread mentions badge does not exist
            cy.get('#publicChannel').scrollIntoView();
            cy.get('#sidebarItem_town-square').
                find('#unreadMentions').
                should('be.not.visible');

            // # Go to the channel where you were messaged
            cy.get('#sidebarItem_town-square').click({force: true});

            // # Get last post message text
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).as('postMessageText');
            });

            // * Verify message contents
            cy.get('@postMessageText').
                should('be.visible').
                and('have.text', message);

            // * Verify it's not highlighted
            cy.get('@postMessageText').
                find(`[data-mention=${receiver.username}]`).
                should('not.exist');
        });
    });

    it('M17445 - Words that trigger mentions support Chinese', () => {
        var customText = '番茄';

        // # Set Notification settings
        setNotificationSettings({first: false, username: false, shouts: false, custom: true, customText});
        const message = '番茄 I\'m messaging you!';
        const message2 = '我爱吃番茄炒饭 I\'m messaging you!';

        // # Use another account to post a message @-mentioning our receiver
        cy.postMessageAs({sender, message, channelId: townsquareChannelId});

        // # Check mention on /ad-1/channels/town-square
        // * Verify unread mentions badge
        cy.get('#publicChannel').scrollIntoView();

        cy.get('#sidebarItem_town-square').
            scrollIntoView().
            find('#unreadMentions').
            should('be.visible').
            and('have.text', '1');

        // * Go to that channel
        cy.get('#sidebarItem_town-square').click({force: true});

        // # Get last post message text
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).as('postMessageText');
        });

        // * Verify entire message
        cy.get('@postMessageText').
            should('be.visible').
            and('have.text', message);

        // * Verify highlight of username
        cy.get('@postMessageText').
            find('.mention--highlight').
            should('be.visible').
            and('have.text', '番茄');

        // # Check mention on /ad-1/channels/off-topic
        cy.postMessageAs({sender: sysadmin, message: message2, channelId: offTopicChannelId});

        // * Verify unread mentions badge
        cy.get('#publicChannel').scrollIntoView();

        cy.get('#sidebarItem_off-topic').
            scrollIntoView().
            find('#unreadMentions').
            should('be.visible').
            and('have.text', '1');

        // * Go to that channel
        cy.get('#sidebarItem_off-topic').click({force: true});

        // # Get last post message text
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).as('postMessageText');
        });

        // * Verify entire message
        cy.get('@postMessageText').
            should('be.visible').
            and('have.text', message2);

        // * Verify highlight of username
        cy.get('@postMessageText').
            find('.mention--highlight').
            should('be.visible').
            and('have.text', '番茄');
    });
});
