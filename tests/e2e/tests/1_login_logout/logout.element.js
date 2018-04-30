// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Constants} from '../../utils';

module.exports = {
    '@tags': ['logout'],
    before: (client) => {
        const testUser = Constants.USERS.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate().
            login(testUser.email, testUser.password);
    },
    after: (client) => client.end(),
    'Test logout action': (client) => {
        const logoutPage = client.page.logoutPage();

        logoutPage.navigate().
            logout();
    },
};
