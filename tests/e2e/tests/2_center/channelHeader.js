// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../../utils';

module.exports = {
    '@tags': ['channel_header'],
    before: (client) => {
        const testUser = Constants.USERS.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate()
            .login(testUser.email, testUser.password);
    },
    after: (client) => client.end(),
    'Test center page': (client) => {
        const centerChannelHeader = client.page.centerChannelHeader();

        centerChannelHeader.navigate()
            .navigateToPage()
            .assert.visible('@headerContainer')
            .assert.visible('@flexParent')
            .assert.visible('@headerInfo')
            .assert.visible('@toggleFavorite')
            .assert.visible('@dropdownButton')
            .assert.hidden('@dropdownMenu')
            .assert.visible('@headerDescription')
            .assert.visible('@headerMember')
            .assert.visible('@headerMemberText')
            .assert.visible('@headerMemberIcon')
            .assert.visible('@headerPin')
            .assert.visible('@headerSearchBar')
            .assert.visible('@headerAtMention')
            .assert.visible('@headerFlag');
    }
};