// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../../utils';

module.exports = {
    '@tags': ['tutorial'],
    before: (client) => {
        const testUser = Constants.USERS.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate()
            .login(testUser.email, testUser.password);
    },
    after: (client) => client.end(),
    'Test tutorial steps action': (client) => {
        const tutorialPage = client.page.tutorialPage();

        tutorialPage.navigate()
            .nextTutorial();
    }
};
