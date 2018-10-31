// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

module.exports = {
    '@tags': ['channel_header_dropdown'],
    before: (client) => {
        const testUser = client.globals.testUsers.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate().
            login(testUser.email, testUser.password);
    },
    after: (client) => client.end(),
    'Channel header dropdown - element check': (client) => {
        const channelHeaderPage = client.page.channelHeaderPage();
        channelHeaderPage.navigateToChannelHeaderDropdown();

        const channelHeaderDropdownPage = client.page.channelHeaderDropdownPage();
        channelHeaderDropdownPage.expect.section('@channelHeaderDropdownMenu').to.be.visible;

        const channelHeaderDropdownMenuSection = channelHeaderDropdownPage.section.channelHeaderDropdownMenu;
        channelHeaderDropdownMenuSection.
            assert.visible('@channelViewInfo').
            assert.containsText('@channelViewInfo', 'View Info').
            assert.visible('@channelManageMembers').
            assert.containsText('@channelManageMembers', 'View Members').
            assert.visible('@channelNotificationsGroup').
            assert.containsText('@channelNotificationsGroup', 'Notification Preferences').
            assert.visible('@channelMute').
            assert.containsText('@channelMute', 'Mute Channel').
            assert.elementNotPresent('@channelUnmute').
            assert.visible('@channelEditHeader').
            assert.containsText('@channelEditHeader', 'Edit Channel Header').
            assert.visible('@channelEditPurpose').
            assert.containsText('@channelEditPurpose', 'Edit Channel Purpose').
            assert.visible('@channelRename').
            assert.containsText('@channelRename', 'Rename Channel');

        const channelHeaderInfoSection = channelHeaderPage.section.channelHeader.section.channelHeaderInfo;
        channelHeaderInfoSection.click('@channelHeaderDropdownButton');
    },
    'Channel header dropdown - check mute channel then mute': (client) => {
        const channelHeaderPage = client.page.channelHeaderPage();
        channelHeaderPage.navigateToChannelHeaderDropdown();

        const channelHeaderDropdownPage = client.page.channelHeaderDropdownPage();
        channelHeaderDropdownPage.expect.section('@channelHeaderDropdownMenu').to.be.visible;

        const channelHeaderDropdownMenuSection = channelHeaderDropdownPage.section.channelHeaderDropdownMenu;
        channelHeaderDropdownMenuSection.
            assert.visible('@channelMute').
            assert.elementNotPresent('@channelUnmute');

        channelHeaderDropdownMenuSection.click('@channelMute');
    },
    'Channel header dropdown - check unmute channel then unmute': (client) => {
        const channelHeaderPage = client.page.channelHeaderPage();
        channelHeaderPage.navigateToChannelHeaderDropdown();

        const channelHeaderDropdownPage = client.page.channelHeaderDropdownPage();
        channelHeaderDropdownPage.expect.section('@channelHeaderDropdownMenu').to.be.visible;

        const channelHeaderDropdownMenuSection = channelHeaderDropdownPage.section.channelHeaderDropdownMenu;
        channelHeaderDropdownMenuSection.
            assert.elementNotPresent('@channelMute').
            assert.visible('@channelUnmute');

        channelHeaderDropdownMenuSection.click('@channelUnmute');
    },
};
