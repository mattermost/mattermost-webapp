// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Constants} from '../../utils';

module.exports = {
    '@tags': ['account_settings', 'account_settings_display'],
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
    'Test account settings display - Clock Display': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@displayButton');
        accountSettingsModalSection.expect.section('@displaySettings').to.be.visible;

        const displaySettingsSection = accountSettingsModalSection.section.displaySettings;

        // contents and cancel check
        displaySettingsSection.
            waitForElementVisible('@clockEdit', Constants.DEFAULT_WAIT).
            click('@clockEdit').
            assert.containsText('.setting-list-item', '12-hour clock (example: 4:00 PM)').
            assert.containsText('.setting-list-item', '24-hour clock (example: 16:00)').
            assert.containsText('.setting-list-item', 'Select how you prefer time displayed.').
            waitForElementVisible('#clockFormatA', Constants.DEFAULT_WAIT).
            waitForElementVisible('#clockFormatB', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            assert.containsText('@clockDesc', '12-hour clock (example: 4:00 PM)');

        // save/change setting to 24-hour clock
        displaySettingsSection.
            waitForElementVisible('@clockEdit', Constants.DEFAULT_WAIT).
            click('@clockEdit').
            waitForElementVisible('#clockFormatB', Constants.DEFAULT_WAIT).
            click('#clockFormatB').
            click('#saveSetting').
            assert.containsText('@clockDesc', '24-hour clock (example: 16:00)');

        // save/change setting to 12-hour clock
        displaySettingsSection.
            waitForElementVisible('@clockEdit', Constants.DEFAULT_WAIT).
            click('@clockEdit').
            waitForElementVisible('#clockFormatA', Constants.DEFAULT_WAIT).
            click('#clockFormatA').
            click('#saveSetting').
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
            waitForElementVisible('@teammateNameDisplayEdit', Constants.DEFAULT_WAIT).
            click('@teammateNameDisplayEdit').
            assert.containsText('.setting-list-item', 'Show username').
            assert.containsText('.setting-list-item', 'Show nickname if one exists, otherwise show first and last name').
            assert.containsText('.setting-list-item', 'Show first and last name').
            assert.containsText('.setting-list-item', 'Show username').
            waitForElementVisible('#name_formatFormatA', Constants.DEFAULT_WAIT).
            waitForElementVisible('#name_formatFormatB', Constants.DEFAULT_WAIT).
            waitForElementVisible('#name_formatFormatC', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            assert.containsText('@teammateNameDisplayDesc', 'Show username');

        // save/change setting to "Show nickname if one exists, otherwise show first and last name"
        displaySettingsSection.
            waitForElementVisible('@teammateNameDisplayEdit', Constants.DEFAULT_WAIT).
            click('@teammateNameDisplayEdit').
            waitForElementVisible('#name_formatFormatB', Constants.DEFAULT_WAIT).
            click('#name_formatFormatB').
            click('#saveSetting').
            assert.containsText('@teammateNameDisplayDesc', 'Show nickname if one exists, otherwise show first and last name');

        // save/change setting to "Show first and last name"
        displaySettingsSection.
            waitForElementVisible('@teammateNameDisplayEdit', Constants.DEFAULT_WAIT).
            click('@teammateNameDisplayEdit').
            waitForElementVisible('#name_formatFormatC', Constants.DEFAULT_WAIT).
            click('#name_formatFormatC').
            click('#saveSetting').
            assert.containsText('@teammateNameDisplayDesc', 'Show first and last name');

        // save/change setting to "Show username"
        displaySettingsSection.
            waitForElementVisible('@teammateNameDisplayEdit', Constants.DEFAULT_WAIT).
            click('@teammateNameDisplayEdit').
            waitForElementVisible('#name_formatFormatA', Constants.DEFAULT_WAIT).
            click('#name_formatFormatA').
            click('#saveSetting').
            assert.containsText('@teammateNameDisplayDesc', 'Show username');
    },
    'Test account settings display - Website Link Previews': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@displayButton');
        accountSettingsModalSection.expect.section('@displaySettings').to.be.visible;

        const displaySettingsSection = accountSettingsModalSection.section.displaySettings;

        // contents and cancel check
        displaySettingsSection.
            waitForElementVisible('@linkPreviewEdit', Constants.DEFAULT_WAIT).
            click('@linkPreviewEdit').
            assert.containsText('.setting-list-item', 'Off').
            assert.containsText('.setting-list-item', 'On').
            assert.containsText('.setting-list-item', 'When available, the first web link in a message will show a preview of the website content below the message.').
            waitForElementVisible('#linkpreviewFormatA', Constants.DEFAULT_WAIT).
            waitForElementVisible('#linkpreviewFormatB', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            assert.containsText('@linkPreviewDesc', 'On');

        // save/change setting to Off link previews
        displaySettingsSection.
            waitForElementVisible('@linkPreviewEdit', Constants.DEFAULT_WAIT).
            click('@linkPreviewEdit').
            waitForElementVisible('#linkpreviewFormatB', Constants.DEFAULT_WAIT).
            click('#linkpreviewFormatB').
            click('#saveSetting').
            assert.containsText('@linkPreviewDesc', 'Off');

        // save/change setting to On link previews
        displaySettingsSection.
            waitForElementVisible('@linkPreviewEdit', Constants.DEFAULT_WAIT).
            click('@linkPreviewEdit').
            waitForElementVisible('#linkpreviewFormatA', Constants.DEFAULT_WAIT).
            click('#linkpreviewFormatA').
            click('#saveSetting').
            assert.containsText('@linkPreviewDesc', 'On');
    },
    'Test account settings display - Default appearance of image previews': (client) => {
        const accountSettingsModalPage = client.page.accountSettingsModalPage();
        accountSettingsModalPage.expect.section('@accountSettingsModal').to.be.visible;

        const accountSettingsModalSection = accountSettingsModalPage.section.accountSettingsModal;

        accountSettingsModalSection.click('@displayButton');
        accountSettingsModalSection.expect.section('@displaySettings').to.be.visible;

        const displaySettingsSection = accountSettingsModalSection.section.displaySettings;

        // contents and cancel check
        displaySettingsSection.
            waitForElementVisible('@collapseEdit', Constants.DEFAULT_WAIT).
            click('@collapseEdit').
            assert.containsText('.setting-list-item', 'Expanded').
            assert.containsText('.setting-list-item', 'Collapsed').
            assert.containsText('.setting-list-item', 'Set whether previews of image links and image attachment thumbnails show as expanded or collapsed by default. This setting can also be controlled using the slash commands /expand and /collapse.').
            waitForElementVisible('#collapseFormatA', Constants.DEFAULT_WAIT).
            waitForElementVisible('#collapseFormatB', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            assert.containsText('@collapseDesc', 'Expanded');

        // save/change setting to Expanded
        displaySettingsSection.
            waitForElementVisible('@collapseEdit', Constants.DEFAULT_WAIT).
            click('@collapseEdit').
            waitForElementVisible('#collapseFormatB', Constants.DEFAULT_WAIT).
            click('#collapseFormatB').
            click('#saveSetting').
            assert.containsText('@collapseDesc', 'Collapsed');

        // save/change setting to Collapsed
        displaySettingsSection.
            waitForElementVisible('@collapseEdit', Constants.DEFAULT_WAIT).
            click('@collapseEdit').
            waitForElementVisible('#collapseFormatA', Constants.DEFAULT_WAIT).
            click('#collapseFormatA').
            click('#saveSetting').
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
            waitForElementVisible('@messageDisplayEdit', Constants.DEFAULT_WAIT).
            click('@messageDisplayEdit').
            assert.containsText('.setting-list-item', 'Standard: Easy to scan and read.').
            assert.containsText('.setting-list-item', 'Compact: Fit as many messages on the screen as we can.').
            assert.containsText('.setting-list-item', 'Select how messages in a channel should be displayed.').
            waitForElementVisible('#message_displayFormatA', Constants.DEFAULT_WAIT).
            waitForElementVisible('#message_displayFormatB', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            assert.containsText('@messageDisplayDesc', 'Standard');

        // save/change setting to "Compact: Fit as many messages on the screen as we can."
        displaySettingsSection.
            waitForElementVisible('@messageDisplayEdit', Constants.DEFAULT_WAIT).
            click('@messageDisplayEdit').
            waitForElementVisible('#message_displayFormatB', Constants.DEFAULT_WAIT).
            click('#message_displayFormatB').
            click('#saveSetting').
            assert.containsText('@messageDisplayDesc', 'Compact');

        // save/change setting to "Standard: Easy to scan and read."
        displaySettingsSection.
            waitForElementVisible('@messageDisplayEdit', Constants.DEFAULT_WAIT).
            click('@messageDisplayEdit').
            waitForElementVisible('#message_displayFormatA', Constants.DEFAULT_WAIT).
            click('#message_displayFormatA').
            click('#saveSetting').
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
            waitForElementVisible('@channelDisplayModeEdit', Constants.DEFAULT_WAIT).
            click('@channelDisplayModeEdit').
            assert.containsText('.setting-list-item', 'Full width').
            assert.containsText('.setting-list-item', 'Fixed width, centered').
            assert.containsText('.setting-list-item', 'Select the width of the center channel.').
            waitForElementVisible('#channel_display_modeFormatA', Constants.DEFAULT_WAIT).
            waitForElementVisible('#channel_display_modeFormatB', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#cancelSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#cancelSetting', 'Cancel').
            click('#cancelSetting').
            assert.containsText('@channelDisplayModeDesc', 'Full width');

        // save/change setting to "Fixed width, centered"
        displaySettingsSection.
            waitForElementVisible('@channelDisplayModeEdit', Constants.DEFAULT_WAIT).
            click('@channelDisplayModeEdit').
            waitForElementVisible('#channel_display_modeFormatB', Constants.DEFAULT_WAIT).
            click('#channel_display_modeFormatB').
            click('#saveSetting').
            assert.containsText('@channelDisplayModeDesc', 'Fixed width, centered');

        // save/change setting to "Full width"
        displaySettingsSection.
            waitForElementVisible('@channelDisplayModeEdit', Constants.DEFAULT_WAIT).
            click('@channelDisplayModeEdit').
            waitForElementVisible('#channel_display_modeFormatA', Constants.DEFAULT_WAIT).
            click('#channel_display_modeFormatA').
            click('#saveSetting').
            assert.containsText('@channelDisplayModeDesc', 'Full width');
    },
};
