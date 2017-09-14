// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../utils';

const logoutCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@mainMenuButton', 3000);
    },
    logout() {
        return this
            .waitForElementVisible('@mainMenuButton', 3000)
            .click('@mainMenuButton')
            .waitForElementVisible('@logoutButton', 3000)
            .click('@logoutButton');
    }
};

module.exports = {
    url: `${Constants.TEST_BASE_URL}`,
    commands: [logoutCommands],
    elements: {
        mainMenuButton: {
            selector: '//*[@id="sidebarHeaderDropdownButton"]/span',
            locateStrategy: 'xpath'
        },
        logoutButton: {
            selector: '//*[@id="logout"]',
            locateStrategy: 'xpath'
        }
    }
};
