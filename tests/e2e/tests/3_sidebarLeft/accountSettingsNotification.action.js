// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

module.exports = {
    '@tags': ['account_settings', 'account_settings_notification'],
    before: (client) => {
        const testUser = client.globals.testUsers.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate().
            login(testUser.email, testUser.password);

        const sidebarLeftPage = client.page.sidebarLeftPage();
        sidebarLeftPage.navigateToAccountSettingsModal();
    },
    after: (client) => {
        const sidebarLeftPage = client.page.sidebarLeftPage();
        sidebarLeftPage.navigateToAccountSettingsModal();
        sidebarLeftPage.click('@sidebarHeaderDropdownButton');

        client.end();
    },
    'Test account settings notifications - Desktop Notifications': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@notificationsButton');
        accountSettingsModalSection.expect.section('@notificationSettings').to.be.visible;

        const notificationSettingsSection = accountSettingsModalSection.section.notificationSettings;

        // contents and cancel check
        notificationSettingsSection.
            waitForElementVisible('@desktopEdit').
            click('@desktopEdit').
            waitForElementVisible('#desktopNotificationAllActivity').
            waitForElementVisible('#desktopNotificationMentions').
            waitForElementVisible('#desktopNotificationNever').
            assert.containsText('.setting-list-item', 'For all activity').
            assert.containsText('.setting-list-item', 'Only for mentions and direct messages').
            assert.containsText('.setting-list-item', 'Never');

        if (client.capabilities.browserName === 'chrome') {
            notificationSettingsSection.
                waitForElementVisible('#soundOn').
                waitForElementVisible('#soundOff').
                assert.containsText('.setting-list-item', 'On').
                assert.containsText('.setting-list-item', 'Off');
        }

        notificationSettingsSection.
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@desktopDesc');

        if (client.capabilities.browserName === 'chrome') {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'For mentions and direct messages, with sound, shown for 5 seconds');
        } else {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'For mentions and direct messages, shown for 5 seconds');
        }

        // save/change setting to For all activity
        notificationSettingsSection.
            waitForElementVisible('@desktopEdit').
            click('@desktopEdit').
            waitForElementVisible('#desktopNotificationAllActivity').
            click('#desktopNotificationAllActivity').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@desktopDesc');

        if (client.capabilities.browserName === 'chrome') {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'For all activity, with sound, shown for 5 seconds');
        } else {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'For all activity, shown for 5 seconds');
        }

        // save/change setting to Never
        notificationSettingsSection.
            waitForElementVisible('@desktopEdit').
            click('@desktopEdit').
            waitForElementVisible('#desktopNotificationNever').
            click('#desktopNotificationNever').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@desktopDesc');

        if (client.capabilities.browserName === 'chrome') {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'Off');
        } else {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'Off');
        }

        // save/change setting to For mentions and direct messages
        notificationSettingsSection.
            waitForElementVisible('@desktopEdit').
            click('@desktopEdit').
            waitForElementVisible('#desktopNotificationMentions').
            click('#desktopNotificationMentions').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@desktopDesc');

        if (client.capabilities.browserName === 'chrome') {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'For mentions and direct messages, with sound, shown for 5 seconds');
        } else {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'For mentions and direct messages, shown for 5 seconds');
        }
    },
    'Test account settings notifications - Email Notifications': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@notificationsButton');
        accountSettingsModalSection.expect.section('@notificationSettings').to.be.visible;

        const notificationSettingsSection = accountSettingsModalSection.section.notificationSettings;

        // contents and cancel check
        notificationSettingsSection.
            waitForElementVisible('@emailEdit').
            click('@emailEdit').
            waitForElementVisible('#emailNotificationImmediately').
            waitForElementVisible('#emailNotificationNever').
            assert.containsText('.setting-list-item', 'Immediately').
            assert.containsText('.setting-list-item', 'Never').
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@emailDesc').
            assert.containsText('@emailDesc', 'Immediately');

        // save/change setting to Never
        notificationSettingsSection.
            waitForElementVisible('@emailEdit').
            click('@emailEdit').
            waitForElementVisible('#emailNotificationNever').
            click('#emailNotificationNever').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@emailDesc').
            assert.containsText('@emailDesc', 'Never');

        // save/change setting to Immediately
        notificationSettingsSection.
            waitForElementVisible('@emailEdit').
            click('@emailEdit').
            waitForElementVisible('#emailNotificationImmediately').
            click('#emailNotificationImmediately').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@emailDesc').
            assert.containsText('@emailDesc', 'Immediately');
    },
    'Test account settings notifications - Mobile Push Notifications': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@notificationsButton');
        accountSettingsModalSection.expect.section('@notificationSettings').to.be.visible;

        const notificationSettingsSection = accountSettingsModalSection.section.notificationSettings;

        // contents and cancel check
        notificationSettingsSection.
            waitForElementVisible('@pushEdit').
            click('@pushEdit').
            waitForElementVisible('#pushNotificationAllActivity').
            waitForElementVisible('#pushNotificationMentions').
            waitForElementVisible('#pushNotificationNever').
            waitForElementVisible('#pushNotificationOnline').
            waitForElementVisible('#pushNotificationAway').
            waitForElementVisible('#pushNotificationOffline').
            assert.containsText('.setting-list-item', 'For all activity').
            assert.containsText('.setting-list-item', 'For mentions and direct messages').
            assert.containsText('.setting-list-item', 'Never').
            assert.containsText('.setting-list-item', 'Online, away or offline').
            assert.containsText('.setting-list-item', 'Away or offline').
            assert.containsText('.setting-list-item', 'Offline').
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@pushDesc').
            assert.containsText('@pushDesc', 'For mentions and direct messages when away or offline');

        // save/change setting to For all activity
        notificationSettingsSection.
            waitForElementVisible('@pushEdit').
            click('@pushEdit').
            waitForElementVisible('#pushNotificationAllActivity').
            click('#pushNotificationAllActivity').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@pushDesc').
            assert.containsText('@pushDesc', 'For all activity when away or offline');

        // save/change setting to Never
        notificationSettingsSection.
            waitForElementVisible('@pushEdit').
            click('@pushEdit').
            waitForElementVisible('#pushNotificationNever').
            click('#pushNotificationNever').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@pushDesc').
            assert.containsText('@pushDesc', 'Never');

        // save/change setting to For mentions and direct messages
        notificationSettingsSection.
            waitForElementVisible('@pushEdit').
            click('@pushEdit').
            waitForElementVisible('#pushNotificationMentions').
            click('#pushNotificationMentions').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@pushDesc').
            assert.containsText('@pushDesc', 'For mentions and direct messages');

        // save/change setting to online, away or offline
        notificationSettingsSection.
            waitForElementVisible('@pushEdit').
            click('@pushEdit').
            waitForElementVisible('#pushNotificationOnline').
            click('#pushNotificationOnline').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@pushDesc').
            assert.containsText('@pushDesc', 'For mentions and direct messages when online, away or offline');

        // save/change setting to offline
        notificationSettingsSection.
            waitForElementVisible('@pushEdit').
            click('@pushEdit').
            waitForElementVisible('#pushNotificationOffline').
            click('#pushNotificationOffline').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@pushDesc').
            assert.containsText('@pushDesc', 'For mentions and direct messages when offline');

        // save/change setting to away or offline
        notificationSettingsSection.
            waitForElementVisible('@pushEdit').
            click('@pushEdit').
            waitForElementVisible('#pushNotificationAway').
            click('#pushNotificationAway').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@pushDesc').
            assert.containsText('@pushDesc', 'For mentions and direct messages when away or offline');
    },

    'Test account settings notifications - Reply Notifications': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@notificationsButton');
        accountSettingsModalSection.expect.section('@notificationSettings').to.be.visible;

        const notificationSettingsSection = accountSettingsModalSection.section.notificationSettings;

        // contents and cancel check
        notificationSettingsSection.
            waitForElementVisible('@commentsEdit').
            click('@commentsEdit').
            waitForElementVisible('#notificationCommentsRoot').
            waitForElementVisible('#notificationCommentsAny').
            waitForElementVisible('#notificationCommentsNever').
            assert.containsText('.setting-list-item', 'Trigger notifications on messages in reply threads that I start or participate in').
            assert.containsText('.setting-list-item', 'Trigger notifications on messages in threads that I start').
            assert.containsText('.setting-list-item', 'Do not trigger notifications on messages in reply threads unless I\'m mentioned').
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@commentsDesc').
            assert.containsText('@commentsDesc', 'Do not trigger notifications on messages in reply threads unless I\'m mentioned');

        // save/change setting to Trigger notifications on messages in threads that I start
        notificationSettingsSection.
            waitForElementVisible('@commentsEdit').
            click('@commentsEdit').
            waitForElementVisible('#notificationCommentsRoot').
            click('#notificationCommentsRoot').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@commentsDesc').
            assert.containsText('@commentsDesc', 'Trigger notifications on messages in threads that I start');

        // save/change setting to Trigger notifications on messages in reply threads that I start or participate in
        notificationSettingsSection.
            waitForElementVisible('@commentsEdit').
            click('@commentsEdit').
            waitForElementVisible('#notificationCommentsAny').
            click('#notificationCommentsAny').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@commentsDesc').
            assert.containsText('@commentsDesc', 'Trigger notifications on messages in reply threads that I start or participate in');

        // save/change setting to Do not trigger notifications on messages in reply threads unless I'm mentioned
        notificationSettingsSection.
            waitForElementVisible('@commentsEdit').
            click('@commentsEdit').
            waitForElementVisible('#notificationCommentsNever').
            click('#notificationCommentsNever').
            waitForElementVisible('#saveSetting').
            click('#saveSetting').
            waitForElementVisible('@commentsDesc').
            assert.containsText('@commentsDesc', 'Do not trigger notifications on messages in reply threads unless I\'m mentioned');
    },
};
