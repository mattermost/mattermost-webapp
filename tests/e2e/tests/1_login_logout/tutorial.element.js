// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

module.exports = {
    '@tags': ['tutorial'],
    before: (client) => {
        const testUser = client.globals.testUsers.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate().
            login(testUser.email, testUser.password);
    },
    after: (client) => client.end(),
    'Test tutorial intro screen pages': (client) => {
        const tutorialPage = client.page.tutorialPage();

        tutorialPage.navigate().
            navigateToScreenTwo().
            navigateToScreenThree().
            navigateToScreenOne().
            navigateWithNextButton();
    },
};
