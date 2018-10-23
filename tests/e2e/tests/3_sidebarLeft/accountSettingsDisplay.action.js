// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

module.exports = {
    '@tags': ['account_settings', 'account_settings_display'],
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
    'Test account settings display - Clock Display': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@displayButton');
        accountSettingsModalSection.expect.section('@displaySettings').to.be.visible;

        const displaySettingsSection = accountSettingsModalSection.section.displaySettings;

        // contents and cancel check
        displaySettingsSection.
            waitForElementVisible('@clockEdit').
            click('@clockEdit').
            assert.containsText('.setting-list-item', '12-hour clock (example: 4:00 PM)').
            assert.containsText('.setting-list-item', '24-hour clock (example: 16:00)').
            assert.containsText('.setting-list-item', 'Select how you prefer time displayed.').
            waitForElementVisible('#clockFormatA').
            waitForElementVisible('#clockFormatB').
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@clockDesc').
            assert.containsText('@clockDesc', '12-hour clock (example: 4:00 PM)');

        // save/change setting to 24-hour clock
        displaySettingsSection.
            waitForElementVisible('@clockEdit').
            click('@clockEdit').
            waitForElementVisible('#clockFormatB').
            click('#clockFormatB').
            click('#saveSetting').
            waitForElementVisible('@clockDesc').
            assert.containsText('@clockDesc', '24-hour clock (example: 16:00)');

        // save/change setting to 12-hour clock
        displaySettingsSection.
            waitForElementVisible('@clockEdit').
            click('@clockEdit').
            waitForElementVisible('#clockFormatA').
            click('#clockFormatA').
            click('#saveSetting').
            waitForElementVisible('@clockDesc').
            assert.containsText('@clockDesc', '12-hour clock (example: 4:00 PM)');
    },
    'Test account settings display - Teammate Name Display': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@displayButton');
        accountSettingsModalSection.expect.section('@displaySettings').to.be.visible;

        const displaySettingsSection = accountSettingsModalSection.section.displaySettings;

        // contents and cancel check
        displaySettingsSection.
            waitForElementVisible('@teammateNameDisplayEdit').
            click('@teammateNameDisplayEdit').
            assert.containsText('.setting-list-item', 'Show username').
            assert.containsText('.setting-list-item', 'Show nickname if one exists, otherwise show first and last name').
            assert.containsText('.setting-list-item', 'Show first and last name').
            assert.containsText('.setting-list-item', 'Show username').
            waitForElementVisible('#name_formatFormatA').
            waitForElementVisible('#name_formatFormatB').
            waitForElementVisible('#name_formatFormatC').
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@teammateNameDisplayDesc').
            assert.containsText('@teammateNameDisplayDesc', 'Show username');

        // save/change setting to "Show nickname if one exists, otherwise show first and last name"
        displaySettingsSection.
            waitForElementVisible('@teammateNameDisplayEdit').
            click('@teammateNameDisplayEdit').
            waitForElementVisible('#name_formatFormatB').
            click('#name_formatFormatB').
            click('#saveSetting').
            waitForElementVisible('@teammateNameDisplayDesc').
            assert.containsText('@teammateNameDisplayDesc', 'Show nickname if one exists, otherwise show first and last name');

        // save/change setting to "Show first and last name"
        displaySettingsSection.
            waitForElementVisible('@teammateNameDisplayEdit').
            click('@teammateNameDisplayEdit').
            waitForElementVisible('#name_formatFormatC').
            click('#name_formatFormatC').
            click('#saveSetting').
            waitForElementVisible('@teammateNameDisplayDesc').
            assert.containsText('@teammateNameDisplayDesc', 'Show first and last name');

        // save/change setting to "Show username"
        displaySettingsSection.
            waitForElementVisible('@teammateNameDisplayEdit').
            click('@teammateNameDisplayEdit').
            waitForElementVisible('#name_formatFormatA').
            click('#name_formatFormatA').
            click('#saveSetting').
            waitForElementVisible('@teammateNameDisplayDesc').
            assert.containsText('@teammateNameDisplayDesc', 'Show username');
    },

    // 'Test account settings display - Website Link Previews': (client) => {
    //     const accountSettingsModalPage = client.page.accountSettingsModalPage();
    //     accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

    //     const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

    //     accountSettingsModalSection.click('@displayButton');
    //     accountSettingsModalSection.expect.section('@displaySettings').to.be.visible;

    //     const displaySettingsSection = accountSettingsModalSection.section.displaySettings;

    //     // contents and cancel check
    //     displaySettingsSection.
    //         waitForElementVisible('@linkPreviewEdit', Constants.DEFAULT_WAIT).
    //         click('@linkPreviewEdit').
    //         assert.containsText('.setting-list-item', 'Off').
    //         assert.containsText('.setting-list-item', 'On').
    //         assert.containsText('.setting-list-item', 'When available, the first web link in a message will show a preview of the website content below the message.').
    //         waitForElementVisible('#linkpreviewFormatA', Constants.DEFAULT_WAIT).
    //         waitForElementVisible('#linkpreviewFormatB', Constants.DEFAULT_WAIT).
    //         waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
    //         assert.containsText('#saveSetting', 'Save').
    //         waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
    //         assert.containsText('#cancelSetting', 'Cancel').
    //         click('#cancelSetting').
    //         waitForElementVisible('@linkPreviewDesc', Constants.DEFAULT_WAIT).
    //         assert.containsText('@linkPreviewDesc', 'On');

    //     // save/change setting to Off link previews
    //     displaySettingsSection.
    //         waitForElementVisible('@linkPreviewEdit', Constants.DEFAULT_WAIT).
    //         click('@linkPreviewEdit').
    //         waitForElementVisible('#linkpreviewFormatB', Constants.DEFAULT_WAIT).
    //         click('#linkpreviewFormatB').
    //         click('#saveSetting').
    //         waitForElementVisible('@linkPreviewDesc', Constants.DEFAULT_WAIT).
    //         assert.containsText('@linkPreviewDesc', 'Off');

    //     // save/change setting to On link previews
    //     displaySettingsSection.
    //         waitForElementVisible('@linkPreviewEdit', Constants.DEFAULT_WAIT).
    //         click('@linkPreviewEdit').
    //         waitForElementVisible('#linkpreviewFormatA', Constants.DEFAULT_WAIT).
    //         click('#linkpreviewFormatA').
    //         click('#saveSetting').
    //         waitForElementVisible('@linkPreviewDesc', Constants.DEFAULT_WAIT).
    //         assert.containsText('@linkPreviewDesc', 'On');
    // },
    'Test account settings display - Default appearance of image previews': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@displayButton');
        accountSettingsModalSection.expect.section('@displaySettings').to.be.visible;

        const displaySettingsSection = accountSettingsModalSection.section.displaySettings;

        // contents and cancel check
        displaySettingsSection.
            waitForElementVisible('@collapseEdit').
            click('@collapseEdit').
            assert.containsText('.setting-list-item', 'Expanded').
            assert.containsText('.setting-list-item', 'Collapsed').
            assert.containsText('.setting-list-item', 'Set whether previews of image links and image attachment thumbnails show as expanded or collapsed by default. This setting can also be controlled using the slash commands /expand and /collapse.').
            waitForElementVisible('#collapseFormatA').
            waitForElementVisible('#collapseFormatB').
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@collapseDesc').
            assert.containsText('@collapseDesc', 'Expanded');

        // save/change setting to Expanded
        displaySettingsSection.
            waitForElementVisible('@collapseEdit').
            click('@collapseEdit').
            waitForElementVisible('#collapseFormatB').
            click('#collapseFormatB').
            click('#saveSetting').
            waitForElementVisible('@collapseDesc').
            assert.containsText('@collapseDesc', 'Collapsed');

        // save/change setting to Collapsed
        displaySettingsSection.
            waitForElementVisible('@collapseEdit').
            click('@collapseEdit').
            waitForElementVisible('#collapseFormatA').
            click('#collapseFormatA').
            click('#saveSetting').
            waitForElementVisible('@collapseDesc').
            assert.containsText('@collapseDesc', 'Expanded');
    },
    'Test account settings display - Message Display': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@displayButton');
        accountSettingsModalSection.expect.section('@displaySettings').to.be.visible;

        const displaySettingsSection = accountSettingsModalSection.section.displaySettings;

        // contents and cancel check
        displaySettingsSection.
            waitForElementVisible('@messageDisplayEdit').
            click('@messageDisplayEdit').
            assert.containsText('.setting-list-item', 'Standard: Easy to scan and read.').
            assert.containsText('.setting-list-item', 'Compact: Fit as many messages on the screen as we can.').
            assert.containsText('.setting-list-item', 'Select how messages in a channel should be displayed.').
            waitForElementVisible('#message_displayFormatA').
            waitForElementVisible('#message_displayFormatB').
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@messageDisplayDesc').
            assert.containsText('@messageDisplayDesc', 'Standard');

        // save/change setting to "Compact: Fit as many messages on the screen as we can."
        displaySettingsSection.
            waitForElementVisible('@messageDisplayEdit').
            click('@messageDisplayEdit').
            waitForElementVisible('#message_displayFormatB').
            click('#message_displayFormatB').
            click('#saveSetting').
            waitForElementVisible('@messageDisplayDesc').
            assert.containsText('@messageDisplayDesc', 'Compact');

        // save/change setting to "Standard: Easy to scan and read."
        displaySettingsSection.
            waitForElementVisible('@messageDisplayEdit').
            click('@messageDisplayEdit').
            waitForElementVisible('#message_displayFormatA').
            click('#message_displayFormatA').
            click('#saveSetting').
            waitForElementVisible('@messageDisplayDesc').
            assert.containsText('@messageDisplayDesc', 'Standard');
    },
    'Test account settings display - Channel Display Mode': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@displayButton');
        accountSettingsModalSection.expect.section('@displaySettings').to.be.visible;

        const displaySettingsSection = accountSettingsModalSection.section.displaySettings;

        // contents and cancel check
        displaySettingsSection.
            waitForElementVisible('@channelDisplayModeEdit').
            click('@channelDisplayModeEdit').
            assert.containsText('.setting-list-item', 'Full width').
            assert.containsText('.setting-list-item', 'Fixed width, centered').
            assert.containsText('.setting-list-item', 'Select the width of the center channel.').
            waitForElementVisible('#channel_display_modeFormatA').
            waitForElementVisible('#channel_display_modeFormatB').
            waitForElementVisible('#saveSetting').
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting').
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            waitForElementVisible('@channelDisplayModeDesc').
            assert.containsText('@channelDisplayModeDesc', 'Full width');

        // save/change setting to "Fixed width, centered"
        displaySettingsSection.
            waitForElementVisible('@channelDisplayModeEdit').
            click('@channelDisplayModeEdit').
            waitForElementVisible('#channel_display_modeFormatB').
            click('#channel_display_modeFormatB').
            click('#saveSetting').
            waitForElementVisible('@channelDisplayModeDesc').
            assert.containsText('@channelDisplayModeDesc', 'Fixed width, centered');

        // save/change setting to "Full width"
        displaySettingsSection.
            waitForElementVisible('@channelDisplayModeEdit').
            click('@channelDisplayModeEdit').
            waitForElementVisible('#channel_display_modeFormatA').
            click('#channel_display_modeFormatA').
            click('#saveSetting').
            waitForElementVisible('@channelDisplayModeDesc').
            assert.containsText('@channelDisplayModeDesc', 'Full width');
    },
};
