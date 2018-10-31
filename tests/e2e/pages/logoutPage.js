// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const logoutCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@mainMenuButton');
    },
    logout() {
        return this.
            waitForElementVisible('@mainMenuButton').
            click('@mainMenuButton').
            waitForElementVisible('@logoutButton').
            click('@logoutButton');
    },
};

module.exports = {
    url: function() { // eslint-disable-line object-shorthand
        return this.api.launchUrl;
    },
    commands: [logoutCommands],
    elements: {
        mainMenuButton: {selector: '#sidebarHeaderDropdownButton'},
        logoutButton: {selector: '#logout'},
    },
};
