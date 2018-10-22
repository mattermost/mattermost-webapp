// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

module.exports = {
    '@tags': ['logout'],
    before: (client) => {
        const testUser = client.globals.testUsers.test;
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
