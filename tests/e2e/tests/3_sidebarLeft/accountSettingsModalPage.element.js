// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

module.exports = {
    '@tags': ['account_settings', 'account_settings_general', 'account_settings_display', 'account_settings_notification'],
    before: (client) => {
        const testUser = client.globals.testUsers.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate().
            login(testUser.email, testUser.password);
    },
    after: (client) => client.end(),
    'Account Settings Modal page - element check': (client) => {
        const sidebarLeftPage = client.page.sidebarLeftPage();
        sidebarLeftPage.navigateToAccountSettingsModal();

        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;
        accountSettingsModalSection.
            assert.visible('@header').
            assert.visible('@title').
            assert.visible('@closeButton').
            assert.visible('@generalButton').
            assert.visible('@securityButton').
            assert.visible('@notificationsButton').
            assert.visible('@displayButton').
            assert.visible('@advancedButton');

        accountSettingsModalSection.expect.section('@tabList').to.be.visible;

        accountSettingsModalSection.click('@displayButton');
        accountSettingsModalSection.expect.section('@displaySettings').to.be.visible;

        sidebarLeftPage.click('@sidebarHeaderDropdownButton');
    },
    'Account Settings Modal page, Tab List - element check': (client) => {
        const sidebarLeftPage = client.page.sidebarLeftPage();
        sidebarLeftPage.navigateToAccountSettingsModal();

        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;
        accountSettingsModalSection.expect.section('@tabList').to.be.visible;
        const tabListSection = accountSettingsModalSection.section.tabList;

        tabListSection.
            assert.visible('@generalLi').
            assert.visible('@generalButton').
            assert.visible('@securityLi').
            assert.visible('@securityButton').
            assert.visible('@notificationsLi').
            assert.visible('@notificationsButton').
            assert.visible('@displayLi').
            assert.visible('@displayButton').
            assert.visible('@advancedLi').
            assert.visible('@advancedButton');

        sidebarLeftPage.click('@sidebarHeaderDropdownButton');
    },
    'Account Settings Modal page, General section - element check': (client) => {
        const testUser = client.globals.testUsers.test;
        const sidebarLeftPage = client.page.sidebarLeftPage();
        sidebarLeftPage.navigateToAccountSettingsModal();

        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;
        accountSettingsModalSection.click('@generalButton');
        accountSettingsModalSection.expect.section('@generalSettings').to.be.visible;

        const generalSettingsSection = accountSettingsModalSection.section.generalSettings;
        generalSettingsSection.
            assert.visible('@generalSettingsTitle').
            assert.containsText('@generalSettingsTitle', 'General Settings').
            assert.visible('@nameTitle').
            assert.containsText('@nameTitle', 'Full Name').
            assert.visible('@nameEdit').
            assert.visible('@nameDesc').
            assert.containsText('@nameDesc', "Click 'Edit' to add your full name").
            assert.visible('@usernameTitle').
            assert.containsText('@usernameTitle', 'Username').
            assert.visible('@usernameEdit').
            assert.visible('@usernameDesc').
            assert.containsText('@usernameDesc', testUser.username).
            assert.visible('@nicknameTitle').
            assert.containsText('@nicknameTitle', 'Nickname').
            assert.visible('@nicknameEdit').
            assert.visible('@nicknameDesc').
            assert.containsText('@nicknameDesc', "Click 'Edit' to add a nickname").
            assert.visible('@positionTitle').
            assert.containsText('@positionTitle', 'Position').
            assert.visible('@positionEdit').
            assert.visible('@positionDesc').
            assert.containsText('@positionDesc', "Click 'Edit' to add your job title / position").
            assert.visible('@emailTitle').
            assert.containsText('@emailTitle', 'Email').
            assert.visible('@emailEdit').
            assert.visible('@emailDesc').
            assert.containsText('@emailDesc', 'test@test.com').
            assert.visible('@pictureTitle').
            assert.containsText('@pictureTitle', 'Profile Picture').
            assert.visible('@pictureEdit').
            assert.visible('@pictureDesc').
            assert.containsText('@pictureDesc', "Click 'Edit' to upload an image.");

        sidebarLeftPage.click('@sidebarHeaderDropdownButton');
    },
    'Account Settings Modal page, Notification section - element check': (client) => {
        const sidebarLeftPage = client.page.sidebarLeftPage();
        sidebarLeftPage.navigateToAccountSettingsModal();

        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;
        accountSettingsModalSection.click('@notificationsButton');
        accountSettingsModalSection.expect.section('@notificationSettings').to.be.visible;

        const notificationSettingsSection = accountSettingsModalSection.section.notificationSettings;
        notificationSettingsSection.
            assert.visible('@notificationSettingsTitle').
            assert.containsText('@notificationSettingsTitle', 'Notifications').
            assert.visible('@desktopTitle').
            assert.containsText('@desktopTitle', 'Desktop notifications').
            assert.visible('@desktopEdit').
            assert.visible('@desktopDesc').
            assert.visible('@emailTitle').
            assert.containsText('@emailTitle', 'Email notifications').
            assert.visible('@emailEdit').
            assert.visible('@emailDesc').
            assert.containsText('@emailDesc', 'Immediately').
            assert.visible('@pushTitle').
            assert.containsText('@pushTitle', 'Mobile push notifications').
            assert.visible('@pushEdit').
            assert.visible('@pushDesc').
            assert.containsText('@pushDesc', 'For mentions and direct messages when away or offline').
            assert.visible('@keysTitle').
            assert.containsText('@keysTitle', 'Words that trigger mentions').
            assert.visible('@keysEdit').
            assert.visible('@keysDesc').
            assert.containsText('@keysDesc', '"@test", "test", "@channel", "@all", "@here"').
            assert.visible('@commentsTitle').
            assert.containsText('@commentsTitle', 'Reply notifications').
            assert.visible('@commentsEdit').
            assert.visible('@commentsDesc').
            assert.containsText('@commentsDesc', 'Do not trigger notifications on messages in reply threads unless I\'m mentioned');

        if (client.capabilities.browserName === 'chrome') {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'For mentions and direct messages, with sound, shown for 5 seconds');
        } else {
            notificationSettingsSection.assert.containsText('@desktopDesc', 'For mentions and direct messages, shown for 5 seconds');
        }

        sidebarLeftPage.click('@sidebarHeaderDropdownButton');
    },
    'Account Settings Modal page, Display section - element check': (client) => {
        const sidebarLeftPage = client.page.sidebarLeftPage();
        sidebarLeftPage.navigateToAccountSettingsModal();

        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;
        accountSettingsModalSection.click('@displayButton');
        accountSettingsModalSection.expect.section('@displaySettings').to.be.visible;

        const displaySettingsSection = accountSettingsModalSection.section.displaySettings;
        displaySettingsSection.
            assert.visible('@displaySettingsTitle').
            assert.containsText('@displaySettingsTitle', 'Display Settings').
            assert.visible('@themeTitle').
            assert.containsText('@themeTitle', 'Theme').
            assert.visible('@themeEdit').
            assert.visible('@themeDesc').
            assert.containsText('@themeDesc', 'Open to manage your theme').
            assert.visible('@clockTitle').
            assert.containsText('@clockTitle', 'Clock Display').
            assert.visible('@clockEdit').
            assert.visible('@clockDesc').
            assert.containsText('@clockDesc', '12-hour clock (example: 4:00 PM)').
            assert.visible('@teammateNameDisplayTitle').
            assert.containsText('@teammateNameDisplayTitle', 'Teammate Name Display').
            assert.visible('@teammateNameDisplayEdit').
            assert.visible('@teammateNameDisplayDesc').
            assert.containsText('@teammateNameDisplayDesc', 'Show username').

            // assert.visible('@linkPreviewTitle').
            // assert.containsText('@linkPreviewTitle', 'Website Link Previews').
            // assert.visible('@linkPreviewEdit').
            // assert.visible('@linkPreviewDesc').
            // assert.containsText('@linkPreviewDesc', 'On').
            assert.visible('@collapseTitle').
            assert.containsText('@collapseTitle', 'Default appearance of image previews').
            assert.visible('@collapseEdit').
            assert.visible('@collapseDesc').
            assert.containsText('@collapseDesc', 'Expanded').
            assert.visible('@messageDisplayTitle').
            assert.containsText('@messageDisplayTitle', 'Message Display').
            assert.visible('@messageDisplayEdit').
            assert.visible('@messageDisplayDesc').
            assert.containsText('@messageDisplayDesc', 'Standard').
            assert.visible('@channelDisplayModeTitle').
            assert.containsText('@channelDisplayModeTitle', 'Channel Display Mode').
            assert.visible('@channelDisplayModeEdit').
            assert.visible('@channelDisplayModeDesc').
            assert.containsText('@channelDisplayModeDesc', 'Full width').
            assert.visible('@languageTitle').
            assert.containsText('@languageTitle', 'Language').
            assert.visible('@languageEdit').
            assert.visible('@languageDesc').
            assert.containsText('@languageDesc', 'English');

        sidebarLeftPage.click('@sidebarHeaderDropdownButton');
    },
};
