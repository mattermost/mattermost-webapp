// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

module.exports = {
    '@tags': ['account_settings', 'account_settings_general'],
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
    'Test account settings display - Full Name': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@generalButton');
        accountSettingsModalSection.expect.section('@generalSettings').to.be.visible;

        const generalSettingsSection = accountSettingsModalSection.section.generalSettings;

        // contents and cancel check
        generalSettingsSection.
            waitForElementVisible('@nameEdit').
            click('@nameEdit').
            waitForElementVisible('#firstName').
            waitForElementVisible('#lastName').
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@nameDesc').
            assert.containsText('@nameDesc', "Click 'Edit' to add your full name");

        // save/change full name
        generalSettingsSection.
            waitForElementVisible('@nameEdit').
            click('@nameEdit').
            waitForElementVisible('#firstName').
            setValue('#firstName', 'F').
            click('#saveSetting').
            waitForElementVisible('@nameDesc').
            assert.containsText('@nameDesc', 'F').
            click('@nameEdit').
            waitForElementVisible('#lastName').
            setValue('#lastName', ['L', client.Keys.ENTER]).
            waitForElementVisible('@nameDesc').
            assert.containsText('@nameDesc', 'F L');

        generalSettingsSection.
            waitForElementVisible('@nameEdit').
            click('@nameEdit').
            waitForElementVisible('#firstName').
            waitForElementVisible('#lastName').
            waitForElementVisible('#saveSetting').
            setValue('#firstName', [client.Keys.BACK_SPACE]).
            setValue('#lastName', [client.Keys.BACK_SPACE, client.Keys.ENTER]).
            waitForElementVisible('@nameDesc').
            assert.containsText('@nameDesc', "Click 'Edit' to add your full name");
    },
    'Test account settings display - Username': (client) => {
        const testUser = client.globals.testUsers.test;
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@generalButton');
        accountSettingsModalSection.expect.section('@generalSettings').to.be.visible;

        const generalSettingsSection = accountSettingsModalSection.section.generalSettings;

        // contents and cancel check
        generalSettingsSection.
            waitForElementVisible('@usernameEdit').
            click('@usernameEdit').
            waitForElementVisible('#username').
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@usernameDesc').
            assert.containsText('@usernameDesc', testUser.username);

        // save/change username
        generalSettingsSection.
            waitForElementVisible('@usernameEdit').
            click('@usernameEdit').
            waitForElementVisible('#username').
            setValue('#username', 'Z').
            click('#saveSetting').
            waitForElementVisible('@usernameDesc').
            assert.containsText('@usernameDesc', 'testz').
            click('@usernameEdit').
            waitForElementVisible('#username').
            setValue('#username', [client.Keys.BACK_SPACE, client.Keys.ENTER]).
            waitForElementVisible('@usernameDesc').
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
            waitForElementVisible('@nicknameEdit').
            click('@nicknameEdit').
            waitForElementVisible('#nickname').
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@nicknameDesc').
            assert.containsText('@nicknameDesc', "Click 'Edit' to add a nickname");

        // save/change nickname
        generalSettingsSection.
            waitForElementVisible('@nicknameEdit').
            click('@nicknameEdit').
            waitForElementVisible('#nickname').
            setValue('#nickname', 'N').
            click('#saveSetting').
            waitForElementVisible('@nicknameDesc').
            assert.containsText('@nicknameDesc', 'N').
            click('@nicknameEdit').
            waitForElementVisible('#nickname').
            setValue('#nickname', [client.Keys.BACK_SPACE, client.Keys.ENTER]).
            waitForElementVisible('@nicknameDesc').
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
            waitForElementVisible('@positionEdit').
            click('@positionEdit').
            waitForElementVisible('#position').
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@positionDesc').
            assert.containsText('@positionDesc', "Click 'Edit' to add your job title / position");

        // save/change position
        generalSettingsSection.
            waitForElementVisible('@positionEdit').
            click('@positionEdit').
            waitForElementVisible('#position').
            setValue('#position', 'P').
            click('#saveSetting').
            waitForElementVisible('@positionDesc').
            assert.containsText('@positionDesc', 'P').
            click('@positionEdit').
            waitForElementVisible('#position').
            setValue('#position', [client.Keys.BACK_SPACE, client.Keys.ENTER]).
            waitForElementVisible('@positionDesc').
            assert.containsText('@positionDesc', "Click 'Edit' to add your job title / position");
    },
    'Test account settings display - Email': (client) => {
        const testUser = client.globals.testUsers.test;
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@generalButton');
        accountSettingsModalSection.expect.section('@generalSettings').to.be.visible;

        const generalSettingsSection = accountSettingsModalSection.section.generalSettings;

        // contents and cancel check
        generalSettingsSection.
            waitForElementVisible('@emailEdit').
            click('@emailEdit').
            waitForElementVisible('#primaryEmail').
            waitForElementVisible('#confirmEmail').
            waitForElementVisible('#saveSetting').
            assert.containsText('.setting-list-item', testUser.email).
            assert.containsText('.setting-list-item', 'Email is used for sign-in, notifications, and password reset.').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@emailDesc').
            assert.containsText('@emailDesc', testUser.email);

        // save/change email
        generalSettingsSection.
            waitForElementVisible('@emailEdit').
            click('@emailEdit').
            waitForElementVisible('#primaryEmail').
            waitForElementVisible('#confirmEmail').
            setValue('#primaryEmail', testUser.email + 'E').
            setValue('#confirmEmail', testUser.email + 'E').
            click('#saveSetting').
            waitForElementVisible('@emailDesc').
            assert.containsText('@emailDesc', testUser.email + 'e').
            click('@emailEdit').
            waitForElementVisible('#primaryEmail').
            waitForElementVisible('#confirmEmail').
            assert.containsText('.setting-list-item', testUser.email + 'e').
            setValue('#primaryEmail', testUser.email).
            setValue('#confirmEmail', [testUser.email, client.Keys.ENTER]).
            waitForElementVisible('@emailDesc').
            assert.containsText('@emailDesc', testUser.email);
    },
};
