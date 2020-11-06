// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import {getAdminAccount} from '../../support/env';
import {ignoreUncaughtException, spyNotificationAs} from '../../support/notification';

function setNotificationSettings(desiredSettings = {first: true, username: true, shouts: true, custom: true, customText: '@'}, channel) {
    // Navigate to settings modal
    cy.toAccountSettingsModal();

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
    spyNotificationAs('notifySpy', 'granted');

    // # Navigate to a channel we are NOT going to post to
    cy.get(`#sidebarItem_${channel.name}`).scrollIntoView().click({force: true});
}

describe('at-mention', () => {
    const admin = getAdminAccount();
    let testTeam;
    let otherChannel;
    let townsquareChannelId;
    let offTopicChannelId;
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

            cy.apiGetChannelByName(testTeam.name, 'off-topic').then((out) => {
                offTopicChannelId = out.channel.id;
            });

            // # Login as receiver and visit off-topic channel
            cy.apiLogin(receiver);
            cy.visit(`/${testTeam.name}/channels/off-topic`);
        });
    });

    it('N14571 still triggers notification if username is not listed in words that trigger mentions', () => {
        ignoreUncaughtException();

        // # Set Notification settings
        setNotificationSettings({first: false, username: true, shouts: true, custom: true}, otherChannel);

        const message = `@${receiver.username} I'm messaging you! ${Date.now()}`;

        // # Use another account to post a message @-mentioning our receiver
        cy.postMessageAs({sender, message, channelId: townsquareChannelId});

        const body = `@${sender.username}: ${message}`;

        cy.get('@notifySpy').should('have.been.calledWithMatch', 'Town Square', (args) => {
            expect(args.body, `Notification body: "${args.body}" should match: "${body}"`).to.equal(body);
            expect(args.tag, `Notification tag: "${args.tag}" should match: "${body}"`).to.equal(body);
            return true;
        });

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

    it('N14570 does not trigger notifications with "Your non case-sensitive username" unchecked', () => {
        ignoreUncaughtException();

        // # Set Notification settings
        setNotificationSettings({first: false, username: false, shouts: true, custom: true}, otherChannel);

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
        ignoreUncaughtException();

        // # Set Notification settings
        setNotificationSettings({first: false, username: false, shouts: false, custom: true}, otherChannel);

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

    it('MM-T184 Words that trigger mentions support Chinese', () => {
        ignoreUncaughtException();

        var customText = '番茄';

        // # Set Notification settings
        setNotificationSettings({first: false, username: false, shouts: false, custom: true, customText}, otherChannel);
        const message = '番茄 I\'m messaging you!';
        const message2 = '我爱吃番茄炒饭 I\'m messaging you!';

        // # Use another account to post a message @-mentioning our receiver
        cy.postMessageAs({sender, message, channelId: townsquareChannelId});

        // # Check mention on town-square channel
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

        // # Check mention on off-topic channel
        cy.postMessageAs({sender: admin, message: message2, channelId: offTopicChannelId});

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
