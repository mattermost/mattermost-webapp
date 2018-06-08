// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Constants} from '../../utils';

module.exports = {
    '@tags': ['channel_header'],
    before: (client) => {
        const testUser = Constants.USERS.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate().
            login(testUser.email, testUser.password);
    },
    after: (client) => client.end(),
    'Center page - element check': (client) => {
        const channelHeaderPage = client.page.channelHeaderPage();
        channelHeaderPage.expect.section('@channelHeader').to.be.visible;

        const channelHeaderSection = channelHeaderPage.section.channelHeader;
        channelHeaderSection.
            assert.visible('@channelHeaderPinButton').
            assert.visible('@channelHeaderMentionButton').
            assert.visible('@channelHeaderFlagButton');

        channelHeaderSection.expect.section('@channelHeaderInfo').to.be.visible;
        const channelHeaderInfoSection = channelHeaderSection.section.channelHeaderInfo;
        channelHeaderInfoSection.
            assert.visible('@toggleFavorite').
            assert.visible('@channelHeaderTitle').
            assert.visible('@channelHeaderDescription').
            assert.visible('@channelHeaderDropdownButton').
            assert.visible('@channelHeaderTitle').
            assert.visible('@channelHeaderDropdownIcon').
            assert.hidden('@channelHeaderDropdownMenu');

        channelHeaderSection.expect.section('@channelMember').to.be.visible;
        const channelMemberSection = channelHeaderSection.section.channelMember;
        channelMemberSection.
            assert.visible('@memberPopover').
            assert.visible('@channelMemberCountText').
            assert.visible('@channelMemberIcon');

        channelHeaderSection.expect.section('@searchFormContainer').to.be.visible;
        const searchFormSection = channelHeaderSection.section.searchFormContainer;
        searchFormSection.
            assert.visible('@searchIcon').
            assert.visible('@searchBox').
            assert.hidden('@searchClearButton');
    },
};
