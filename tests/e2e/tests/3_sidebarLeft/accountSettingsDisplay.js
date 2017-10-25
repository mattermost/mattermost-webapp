// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../../utils';

module.exports = {
    '@tags': ['account_settings', 'account_settings_display'],
    before: (client) => {
        const testUser = Constants.USERS.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate()
            .login(testUser.email, testUser.password);
    },
    after: (client) => client.end(),
    'Test account settings display': (client) => {
        const sidebarLeftPage = client.page.sidebarLeftPage();

        const accountSettingsSection = sidebarLeftPage
            .click('@sidebarHeaderDropdownButton')
            .section.sidebarDropdownMenu
            .click('@accountSettings');
    }
};
