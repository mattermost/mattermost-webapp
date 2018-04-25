// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Constants} from '../../utils';

module.exports = {
    '@tags': ['login'],
    after: (client) => client.end(),
    'Login page - element check': (client) => {
        const loginPage = client.page.loginPage();

        loginPage.navigate().
            navigateToPage().
            assert.title('Mattermost').
            assert.visible('@loginInput').
            assert.visible('@passwordInput').
            assert.visible('@signinButton');
    },
    'Test login action': (client) => {
        const testUser = Constants.USERS.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate().
            login(testUser.email, testUser.password);
    },
};
