// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../../utils';

module.exports = {
    '@tags': ['account_settings', 'account_settings_display'],
    before: (client) => {
        const testUser = Constants.USERS.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate()
            .login(testUser.email, testUser.password);
    },
    after: (client) => client.end(),
    'Account Settings Modal page - element check': (client) => {
        const sidebarLeftPage = client.page.sidebarLeftPage();
        sidebarLeftPage.navigateToAccountSettingsModal();

        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;
        accountSettingsModalSection
            .assert.visible('@header')
            .assert.visible('@title')
            .assert.visible('@closeButton')
            .assert.visible('@generalButton')
            .assert.visible('@securityButton')
            .assert.visible('@notificationsButton')
            .assert.visible('@displayButton')
            .assert.visible('@advancedButton');

        accountSettingsModalSection.expect.section('@tabList').to.be.visible;

        accountSettingsModalSection.click('@displayButton');
        accountSettingsModalSection.expect.section('@displaySettings').to.be.visible;

        sidebarLeftPage.click('@sidebarHeaderDropdownButton')
    },
    'Account Settings Modal page, Tab List - element check': (client) => {
        const sidebarLeftPage = client.page.sidebarLeftPage();
        sidebarLeftPage.navigateToAccountSettingsModal();

        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;
        accountSettingsModalSection.expect.section('@tabList').to.be.visible;
        const tabListSection = accountSettingsModalSection.section.tabList;

        tabListSection
            .assert.visible('@generalLi')
            .assert.visible('@generalButton')
            .assert.visible('@securityLi')
            .assert.visible('@securityButton')
            .assert.visible('@notificationsLi')
            .assert.visible('@notificationsButton')
            .assert.visible('@displayLi')
            .assert.visible('@displayButton')
            .assert.visible('@advancedLi')
            .assert.visible('@advancedButton');

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
        displaySettingsSection
            .assert.visible('@displaySettingsTitle')
            .assert.containsText('@displaySettingsTitle', 'Display Settings')
            .assert.visible('@themeTitle')
            .assert.containsText('@themeTitle', 'Theme')
            .assert.visible('@themeEdit')
            .assert.visible('@themeDesc')
            .assert.containsText('@themeDesc', 'Open to manage your theme')
            .assert.visible('@clockTitle')
            .assert.containsText('@clockTitle', 'Clock Display')
            .assert.visible('@clockEdit')
            .assert.visible('@clockDesc')
            .assert.containsText('@clockDesc', '12-hour clock (example: 4:00 PM)')
            .assert.visible('@linkPreviewTitle')
            .assert.containsText('@linkPreviewTitle', 'Website Link Previews')
            .assert.visible('@linkPreviewEdit')
            .assert.visible('@linkPreviewDesc')
            .assert.containsText('@linkPreviewDesc', 'On')
            .assert.visible('@collapseTitle')
            .assert.containsText('@collapseTitle', 'Default appearance of image link previews')
            .assert.visible('@collapseEdit')
            .assert.visible('@collapseDesc')
            .assert.containsText('@collapseDesc', 'Expanded')
            .assert.visible('@messageDisplayTitle')
            .assert.containsText('@messageDisplayTitle', 'Message Display')
            .assert.visible('@messageDisplayEdit')
            .assert.visible('@messageDisplayDesc')
            .assert.containsText('@messageDisplayDesc', 'Standard')
            .assert.visible('@channelDisplayModeTitle')
            .assert.containsText('@channelDisplayModeTitle', 'Channel Display Mode')
            .assert.visible('@channelDisplayModeEdit')
            .assert.visible('@channelDisplayModeDesc')
            .assert.containsText('@channelDisplayModeDesc', 'Full width')
            .assert.visible('@languageTitle')
            .assert.containsText('@languageTitle', 'Language')
            .assert.visible('@languageEdit')
            .assert.visible('@languageDesc')
            .assert.containsText('@languageDesc', 'English');

        sidebarLeftPage.click('@sidebarHeaderDropdownButton');
    }
};
