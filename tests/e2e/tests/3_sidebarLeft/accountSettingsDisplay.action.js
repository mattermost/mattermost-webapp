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
            waitForElementVisible('#Clock_DisplayCancel', Constants.DEFAULT_WAIT).
            assert.containsText('#Clock_DisplayCancel', 'Cancel').
            click('#Clock_DisplayCancel').
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
            waitForElementVisible('#Website_Link_PreviewsCancel', Constants.DEFAULT_WAIT).
            assert.containsText('#Website_Link_PreviewsCancel', 'Cancel').
            click('#Website_Link_PreviewsCancel').
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
    'Test account settings display - Default appearance of image link previews': (client) => {
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
            assert.containsText('.setting-list-item', 'Set whether previews of image links show as expanded or collapsed by default. This setting can also be controlled using the slash commands /expand and /collapse.').
            waitForElementVisible('#collapseFormatA', Constants.DEFAULT_WAIT).
            waitForElementVisible('#collapseFormatB', Constants.DEFAULT_WAIT).
            waitForElementVisible('#saveSetting', Constants.DEFAULT_WAIT).
            assert.containsText('#saveSetting', 'Save').
            waitForElementVisible('#Default_appearance_of_image_link_previewsCancel', Constants.DEFAULT_WAIT).
            assert.containsText('#Default_appearance_of_image_link_previewsCancel', 'Cancel').
            click('#Default_appearance_of_image_link_previewsCancel').
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
};
