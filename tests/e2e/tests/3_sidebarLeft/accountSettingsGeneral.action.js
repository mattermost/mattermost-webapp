// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Constants} from '../../utils';

module.exports = {
    '@tags': ['account_settings', 'account_settings_general'],
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
    'Test account settings display - Full Name': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@generalButton');
        accountSettingsModalSection.expect.section('@generalSettings').to.be.visible;

        const generalSettingsSection = accountSettingsModalSection.section.generalSettings;

        // contents and cancel check
        generalSettingsSection.
            waitForElementVisible('@nameEdit', Constants.DEFAULT_WAIT).
            click('@nameEdit').
            waitForElementVisible('#firstName', Constants.DEFAULT_WAIT).
            waitForElementVisible('#lastName', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            assert.containsText('@nameDesc', "Click 'Edit' to add your full name");

        // save/change full name
        generalSettingsSection.
            waitForElementVisible('@nameEdit', Constants.DEFAULT_WAIT).
            click('@nameEdit').
            waitForElementVisible('#firstName', Constants.DEFAULT_WAIT).
            setValue('#firstName', 'F').
            click('#saveSetting').
            assert.containsText('@nameDesc', 'F').
            click('@nameEdit').
            waitForElementVisible('#lastName', Constants.DEFAULT_WAIT).
            setValue('#lastName', ['L', client.Keys.ENTER]).
            assert.containsText('@nameDesc', 'F L');

        generalSettingsSection.
            waitForElementVisible('@nameEdit', Constants.DEFAULT_WAIT).
            click('@nameEdit').
            waitForElementVisible('#firstName', Constants.DEFAULT_WAIT).
            waitForElementVisible('#lastName', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            setValue('#firstName', [client.Keys.BACK_SPACE, client.Keys.ENTER]).
            setValue('#lastName', [client.Keys.BACK_SPACE, client.Keys.ENTER]).
            assert.containsText('@nameDesc', "Click 'Edit' to add your full name");
    },
    'Test account settings display - Username': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@generalButton');
        accountSettingsModalSection.expect.section('@generalSettings').to.be.visible;

        const generalSettingsSection = accountSettingsModalSection.section.generalSettings;

        // contents and cancel check
        generalSettingsSection.
            waitForElementVisible('@usernameEdit', Constants.DEFAULT_WAIT).
            click('@usernameEdit').
            waitForElementVisible('#username', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            assert.containsText('@usernameDesc', Constants.USERS.test.username);

        // save/change username
        generalSettingsSection.
            waitForElementVisible('@usernameEdit', Constants.DEFAULT_WAIT).
            click('@usernameEdit').
            waitForElementVisible('#username', Constants.DEFAULT_WAIT).
            setValue('#username', 'Z').
            click('#saveSetting').
            assert.containsText('@usernameDesc', 'testz').
            click('@usernameEdit').
            waitForElementVisible('#username', Constants.DEFAULT_WAIT).
            setValue('#username', [client.Keys.BACK_SPACE, client.Keys.ENTER]).
            assert.containsText('@usernameDesc', 'test');
    },
    'Test account settings display - Nickname': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@generalButton');
        accountSettingsModalSection.expect.section('@generalSettings').to.be.visible;

        const generalSettingsSection = accountSettingsModalSection.section.generalSettings;

        // contents and cancel check
        generalSettingsSection.
            waitForElementVisible('@nicknameEdit', Constants.DEFAULT_WAIT).
            click('@nicknameEdit').
            waitForElementVisible('#nickname', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            assert.containsText('@nicknameDesc', "Click 'Edit' to add a nickname");

        // save/change nickname
        generalSettingsSection.
            waitForElementVisible('@nicknameEdit', Constants.DEFAULT_WAIT).
            click('@nicknameEdit').
            waitForElementVisible('#nickname', Constants.DEFAULT_WAIT).
            setValue('#nickname', 'N').
            click('#saveSetting').
            assert.containsText('@nicknameDesc', 'N').
            click('@nicknameEdit').
            waitForElementVisible('#nickname', Constants.DEFAULT_WAIT).
            setValue('#nickname', [client.Keys.BACK_SPACE, client.Keys.ENTER]).
            assert.containsText('@nicknameDesc', "Click 'Edit' to add a nickname");
    },
    'Test account settings display - Position': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@generalButton');
        accountSettingsModalSection.expect.section('@generalSettings').to.be.visible;

        const generalSettingsSection = accountSettingsModalSection.section.generalSettings;

        // contents and cancel check
        generalSettingsSection.
            waitForElementVisible('@positionEdit', Constants.DEFAULT_WAIT).
            click('@positionEdit').
            waitForElementVisible('#position', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            assert.containsText('@positionDesc', "Click 'Edit' to add your job title / position");

        // save/change position
        generalSettingsSection.
            waitForElementVisible('@positionEdit', Constants.DEFAULT_WAIT).
            click('@positionEdit').
            waitForElementVisible('#position', Constants.DEFAULT_WAIT).
            setValue('#position', 'P').
            click('#saveSetting').
            assert.containsText('@positionDesc', 'P').
            click('@positionEdit').
            waitForElementVisible('#position', Constants.DEFAULT_WAIT).
            setValue('#position', [client.Keys.BACK_SPACE, client.Keys.ENTER]).
            assert.containsText('@positionDesc', "Click 'Edit' to add your job title / position");
    },
    'Test account settings display - Email': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@generalButton');
        accountSettingsModalSection.expect.section('@generalSettings').to.be.visible;

        const generalSettingsSection = accountSettingsModalSection.section.generalSettings;

        // contents and cancel check
        generalSettingsSection.
            waitForElementVisible('@emailEdit', Constants.DEFAULT_WAIT).
            click('@emailEdit').
            waitForElementVisible('#primaryEmail', Constants.DEFAULT_WAIT).
            waitForElementVisible('#confirmEmail', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('.setting-list-item', Constants.USERS.test.email).
            assert.containsText('.setting-list-item', 'Email is used for sign-in, notifications, and password reset.').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            assert.containsText('@emailDesc', Constants.USERS.test.email);

        // save/change email
        generalSettingsSection.
            waitForElementVisible('@emailEdit', Constants.DEFAULT_WAIT).
            click('@emailEdit').
            waitForElementVisible('#primaryEmail', Constants.DEFAULT_WAIT).
            waitForElementVisible('#confirmEmail', Constants.DEFAULT_WAIT).
            setValue('#primaryEmail', Constants.USERS.test.email + 'E').
            setValue('#confirmEmail', Constants.USERS.test.email + 'E').
            click('#saveSetting').
            assert.containsText('@emailDesc', Constants.USERS.test.email + 'e').
            click('@emailEdit').
            waitForElementVisible('#primaryEmail', Constants.DEFAULT_WAIT).
            waitForElementVisible('#confirmEmail', Constants.DEFAULT_WAIT).
            assert.containsText('.setting-list-item', Constants.USERS.test.email + 'e').
            setValue('#primaryEmail', Constants.USERS.test.email).
            setValue('#confirmEmail', [Constants.USERS.test.email, client.Keys.ENTER]).
            assert.containsText('@emailDesc', Constants.USERS.test.email);
    },
};
