// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../../utils';

module.exports = {
    '@tags': ['center'],
    before: (client) => {
        const testUser = Constants.USERS.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate()
            .login(testUser.email, testUser.password);
    },
    after: (client) => client.end(),
    'Test center page': (client) => {
        const centerPage = client.page.centerPage();

        centerPage.navigate()
            .navigateToPage()
            .assert.visible('@postTextBox')
            .assert.visible('@fileAttachmentButton')
            .assert.visible('@emojiPickerButton')
            .assert.visible('@helpLink')
            .assert.hidden('@helpText')
            .assert.visible('@postListContent');
    }
};