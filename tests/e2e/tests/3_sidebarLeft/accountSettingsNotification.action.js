// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Constants} from '../../utils';

module.exports = {
    '@tags': ['account_settings', 'account_settings_notification'],
    before: (client) => {
        const testUser = Constants.USERS.test;
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
            waitForElementVisible('@desktopEdit', Constants.DEFAULT_WAIT).
            click('@desktopEdit').
            waitForElementVisible('#desktopNotificationAllActivity', Constants.DEFAULT_WAIT).
            waitForElementVisible('#desktopNotificationMentions', Constants.DEFAULT_WAIT).
            waitForElementVisible('#desktopNotificationNever', Constants.DEFAULT_WAIT).
            assert.containsText('.setting-list-item', 'For all activity').
            assert.containsText('.setting-list-item', 'Only for mentions and direct messages').
            assert.containsText('.setting-list-item', 'Never');

        if (client.capabilities.browserName === 'chrome') {
            notificationSettingsSection.
                waitForElementVisible('#soundOn', Constants.DEFAULT_WAIT).
                waitForElementVisible('#soundOff', Constants.DEFAULT_WAIT).
                assert.containsText('.setting-list-item', 'On').
                assert.containsText('.setting-list-item', 'Off');
        }

        notificationSettingsSection.
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@desktopDesc', Constants.DEFAULT_WAIT);

        if (client.capabilities.browserName === 'chrome') {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'For mentions and direct messages, with sound, shown for 5 seconds');
        } else {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'For mentions and direct messages, shown for 5 seconds');
        }

        // save/change setting to For all activity
        notificationSettingsSection.
            waitForElementVisible('@desktopEdit', Constants.DEFAULT_WAIT).
            click('@desktopEdit').
            waitForElementVisible('#desktopNotificationAllActivity', Constants.DEFAULT_WAIT).
            click('#desktopNotificationAllActivity').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@desktopDesc', Constants.DEFAULT_WAIT);

        if (client.capabilities.browserName === 'chrome') {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'For all activity, with sound, shown for 5 seconds');
        } else {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'For all activity, shown for 5 seconds');
        }

        // save/change setting to Never
        notificationSettingsSection.
            waitForElementVisible('@desktopEdit', Constants.DEFAULT_WAIT).
            click('@desktopEdit').
            waitForElementVisible('#desktopNotificationNever', Constants.DEFAULT_WAIT).
            click('#desktopNotificationNever').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@desktopDesc', Constants.DEFAULT_WAIT);

        if (client.capabilities.browserName === 'chrome') {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'Off');
        } else {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'Off');
        }

        // save/change setting to For mentions and direct messages
        notificationSettingsSection.
            waitForElementVisible('@desktopEdit', Constants.DEFAULT_WAIT).
            click('@desktopEdit').
            waitForElementVisible('#desktopNotificationMentions', Constants.DEFAULT_WAIT).
            click('#desktopNotificationMentions').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@desktopDesc', Constants.DEFAULT_WAIT);

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
            waitForElementVisible('@emailEdit', Constants.DEFAULT_WAIT).
            click('@emailEdit').
            waitForElementVisible('#emailNotificationImmediately', Constants.DEFAULT_WAIT).
            waitForElementVisible('#emailNotificationNever', Constants.DEFAULT_WAIT).
            assert.containsText('.setting-list-item', 'Immediately').
            assert.containsText('.setting-list-item', 'Never').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@emailDesc', Constants.DEFAULT_WAIT).
            assert.containsText('@emailDesc', 'Immediately');

        // save/change setting to Never
        notificationSettingsSection.
            waitForElementVisible('@emailEdit', Constants.DEFAULT_WAIT).
            click('@emailEdit').
            waitForElementVisible('#emailNotificationNever', Constants.DEFAULT_WAIT).
            click('#emailNotificationNever').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@emailDesc', Constants.DEFAULT_WAIT).
            assert.containsText('@emailDesc', 'Never');

        // save/change setting to Immediately
        notificationSettingsSection.
            waitForElementVisible('@emailEdit', Constants.DEFAULT_WAIT).
            click('@emailEdit').
            waitForElementVisible('#emailNotificationImmediately', Constants.DEFAULT_WAIT).
            click('#emailNotificationImmediately').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@emailDesc', Constants.DEFAULT_WAIT).
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
            waitForElementVisible('@pushEdit', Constants.DEFAULT_WAIT).
            click('@pushEdit').
            waitForElementVisible('#pushNotificationAllActivity', Constants.DEFAULT_WAIT).
            waitForElementVisible('#pushNotificationMentions', Constants.DEFAULT_WAIT).
            waitForElementVisible('#pushNotificationNever', Constants.DEFAULT_WAIT).
            waitForElementVisible('#pushNotificationOnline', Constants.DEFAULT_WAIT).
            waitForElementVisible('#pushNotificationAway', Constants.DEFAULT_WAIT).
            waitForElementVisible('#pushNotificationOffline', Constants.DEFAULT_WAIT).
            assert.containsText('.setting-list-item', 'For all activity').
            assert.containsText('.setting-list-item', 'For mentions and direct messages').
            assert.containsText('.setting-list-item', 'Never').
            assert.containsText('.setting-list-item', 'Online, away or offline').
            assert.containsText('.setting-list-item', 'Away or offline').
            assert.containsText('.setting-list-item', 'Offline').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@pushDesc', Constants.DEFAULT_WAIT).
            assert.containsText('@pushDesc', 'For mentions and direct messages when away or offline');

        // save/change setting to For all activity
        notificationSettingsSection.
            waitForElementVisible('@pushEdit', Constants.DEFAULT_WAIT).
            click('@pushEdit').
            waitForElementVisible('#pushNotificationAllActivity', Constants.DEFAULT_WAIT).
            click('#pushNotificationAllActivity').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@pushDesc', Constants.DEFAULT_WAIT).
            assert.containsText('@pushDesc', 'For all activity when away or offline');

        // save/change setting to Never
        notificationSettingsSection.
            waitForElementVisible('@pushEdit', Constants.DEFAULT_WAIT).
            click('@pushEdit').
            waitForElementVisible('#pushNotificationNever', Constants.DEFAULT_WAIT).
            click('#pushNotificationNever').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@pushDesc', Constants.DEFAULT_WAIT).
            assert.containsText('@pushDesc', 'Never');

        // save/change setting to For mentions and direct messages
        notificationSettingsSection.
            waitForElementVisible('@pushEdit', Constants.DEFAULT_WAIT).
            click('@pushEdit').
            waitForElementVisible('#pushNotificationMentions', Constants.DEFAULT_WAIT).
            click('#pushNotificationMentions').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@pushDesc', Constants.DEFAULT_WAIT).
            assert.containsText('@pushDesc', 'For mentions and direct messages');

        // save/change setting to online, away or offline
        notificationSettingsSection.
            waitForElementVisible('@pushEdit', Constants.DEFAULT_WAIT).
            click('@pushEdit').
            waitForElementVisible('#pushNotificationOnline', Constants.DEFAULT_WAIT).
            click('#pushNotificationOnline').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@pushDesc', Constants.DEFAULT_WAIT).
            assert.containsText('@pushDesc', 'For mentions and direct messages when online, away or offline');

        // save/change setting to offline
        notificationSettingsSection.
            waitForElementVisible('@pushEdit', Constants.DEFAULT_WAIT).
            click('@pushEdit').
            waitForElementVisible('#pushNotificationOffline', Constants.DEFAULT_WAIT).
            click('#pushNotificationOffline').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@pushDesc', Constants.DEFAULT_WAIT).
            assert.containsText('@pushDesc', 'For mentions and direct messages when offline');

        // save/change setting to away or offline
        notificationSettingsSection.
            waitForElementVisible('@pushEdit', Constants.DEFAULT_WAIT).
            click('@pushEdit').
            waitForElementVisible('#pushNotificationAway', Constants.DEFAULT_WAIT).
            click('#pushNotificationAway').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@pushDesc', Constants.DEFAULT_WAIT).
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
            waitForElementVisible('@commentsEdit', Constants.DEFAULT_WAIT).
            click('@commentsEdit').
            waitForElementVisible('#notificationCommentsRoot', Constants.DEFAULT_WAIT).
            waitForElementVisible('#notificationCommentsAny', Constants.DEFAULT_WAIT).
            waitForElementVisible('#notificationCommentsNever', Constants.DEFAULT_WAIT).
            assert.containsText('.setting-list-item', 'Trigger notifications on messages in reply threads that I start or participate in').
            assert.containsText('.setting-list-item', 'Trigger notifications on messages in threads that I start').
            assert.containsText('.setting-list-item', 'Do not trigger notifications on messages in reply threads unless I\'m mentioned').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@commentsDesc', Constants.DEFAULT_WAIT).
            assert.containsText('@commentsDesc', 'Do not trigger notifications on messages in reply threads unless I\'m mentioned');

        // save/change setting to Trigger notifications on messages in threads that I start
        notificationSettingsSection.
            waitForElementVisible('@commentsEdit', Constants.DEFAULT_WAIT).
            click('@commentsEdit').
            waitForElementVisible('#notificationCommentsRoot', Constants.DEFAULT_WAIT).
            click('#notificationCommentsRoot').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@commentsDesc', Constants.DEFAULT_WAIT).
            assert.containsText('@commentsDesc', 'Trigger notifications on messages in threads that I start');

        // save/change setting to Trigger notifications on messages in reply threads that I start or participate in
        notificationSettingsSection.
            waitForElementVisible('@commentsEdit', Constants.DEFAULT_WAIT).
            click('@commentsEdit').
            waitForElementVisible('#notificationCommentsAny', Constants.DEFAULT_WAIT).
            click('#notificationCommentsAny').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@commentsDesc', Constants.DEFAULT_WAIT).
            assert.containsText('@commentsDesc', 'Trigger notifications on messages in reply threads that I start or participate in');

        // save/change setting to Do not trigger notifications on messages in reply threads unless I'm mentioned
        notificationSettingsSection.
            waitForElementVisible('@commentsEdit', Constants.DEFAULT_WAIT).
            click('@commentsEdit').
            waitForElementVisible('#notificationCommentsNever', Constants.DEFAULT_WAIT).
            click('#notificationCommentsNever').
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            click('#saveSetting').
            waitForElementVisible('@commentsDesc', Constants.DEFAULT_WAIT).
            assert.containsText('@commentsDesc', 'Do not trigger notifications on messages in reply threads unless I\'m mentioned');
    },
};
