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
            .assert.visible('@themeTitle')
            .assert.visible('@themeEdit')
            .assert.visible('@themeDesc')
            .assert.visible('@clockTitle')
            .assert.visible('@clockEdit')
            .assert.visible('@clockDesc')
            .assert.visible('@linkPreviewTitle')
            .assert.visible('@linkPreviewEdit')
            .assert.visible('@linkPreviewDesc')
            .assert.visible('@collapseTitle')
            .assert.visible('@collapseEdit')
            .assert.visible('@collapseDesc')
            .assert.visible('@messageDisplayTitle')
            .assert.visible('@messageDisplayEdit')
            .assert.visible('@messageDisplayDesc')
            .assert.visible('@channelDisplayModeTitle')
            .assert.visible('@channelDisplayModeEdit')
            .assert.visible('@channelDisplayModeDesc')
            .assert.visible('@languageTitle')
            .assert.visible('@languageEdit')
            .assert.visible('@languageDesc');

        sidebarLeftPage.click('@sidebarHeaderDropdownButton');
    }
};
