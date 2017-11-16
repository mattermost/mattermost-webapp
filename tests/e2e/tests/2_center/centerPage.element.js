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
    'Center page, postListSection - element check': (client) => {
        const centerPage = client.page.centerPage();
        centerPage.expect.section('@postList').to.be.visible;

        const postListSection = centerPage.section.postList;

        postListSection
            .assert.visible('@postListContent')
            .assert.visible('@channelIntro');
    },
    after: (client) => client.end(),
    'Center page, postCreateSection - element check': (client) => {
        const centerPage = client.page.centerPage();
        centerPage.expect.section('@postCreate').to.be.visible;

        const postCreateSection = centerPage.section.postCreate;

        postCreateSection
            .assert.visible('@postTextbox')
            .assert.visible('@fileUploadButton')
            .assert.visible('@emojiPickerButton')
            .assert.visible('@helpTextLink')
            .assert.hidden('@helpText')
            .assert.visible('@postCreateFooter');
    }
};
