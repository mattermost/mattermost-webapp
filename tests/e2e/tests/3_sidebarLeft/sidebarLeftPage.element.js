// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../../utils';

module.exports = {
    '@tags': ['sidebar_left'],
    before: (client) => {
        const testUser = Constants.USERS.test;
        const loginPage = client.page.loginPage();

        loginPage.navigate()
            .login(testUser.email, testUser.password);
    },
    after: (client) => client.end(),
    'Sidebar Left page, sidebarLeftSection - element check': (client) => {
        const sidebarLeftPage = client.page.sidebarLeftPage();

        sidebarLeftPage.expect.section('@sidebarLeft').to.be.visible;
        const sidebarLeftSection = sidebarLeftPage.section.sidebarLeft;
        
        sidebarLeftSection
            .assert.visible('@sidebarSwitcherButton')
            .assert.hidden('@unreadIndicatorTop')
            .assert.hidden('@unreadIndicatorBottom');
    },
    'Sidebar Left page, teamHeaderSection - element check': (client) => {
        const sidebarLeftPage = client.page.sidebarLeftPage();
        const sidebarLeftSection = sidebarLeftPage.section.sidebarLeft;

        sidebarLeftSection.expect.section('@teamHeader').to.be.visible;
        const teamHeaderSection = sidebarLeftSection.section.teamHeader;

        teamHeaderSection
            .assert.visible('@statusDropdown')

        teamHeaderSection.expect.section('@headerInfo').to.be.visible;
        const headerInfoSection = teamHeaderSection.section.headerInfo;

        headerInfoSection
            .assert.visible('@headerUsername')
            .assert.visible('@headerTeamName');

        teamHeaderSection.click('@statusDropdown');
        teamHeaderSection.expect.section('@editStatusMenu').to.be.visible;
        const editStatusMenuSection = teamHeaderSection.section.editStatusMenu;

        editStatusMenuSection
            .assert.visible('@statusOnline')
            .assert.visible('@statusAway')
            .assert.visible('@statusOffline');

        teamHeaderSection.expect.section('@sidebarDropdownMenuContainer').to.be.visible;
        const sidebarDropdownMenuContainerSection = teamHeaderSection.section.sidebarDropdownMenuContainer;

        sidebarDropdownMenuContainerSection
            .assert.visible('@sidebarHeaderDropdownButton');

        sidebarDropdownMenuContainerSection.click('@sidebarHeaderDropdownButton');
        sidebarDropdownMenuContainerSection.expect.section('@sidebarDropdownMenu').to.be.visible;
        const sidebarDropdownMenuSection = sidebarDropdownMenuContainerSection.section.sidebarDropdownMenu;

        sidebarDropdownMenuSection
            .assert.visible('@accountSettings')
            .assert.visible('@sendEmailInvite')
            .assert.visible('@getTeamInviteLink')
            .assert.visible('@addUsersToTeam')
            .assert.visible('@teamSettings')
            .assert.visible('@manageMembers')
            .assert.visible('@createTeam')
            .assert.visible('@leaveTeam')
            .assert.visible('@integrations')
            .assert.visible('@systemConsole')
            .assert.visible('@helpLink')
            .assert.visible('@keyboardShortcuts')
            .assert.visible('@reportLink')
            .assert.visible('@nativeAppLink')
            .assert.visible('@about')
            .assert.visible('@logout');
    },
    'Sidebar Left page, sidebarChannelContainerSection - element check': (client) => {
        const sidebarLeftPage = client.page.sidebarLeftPage();
        const sidebarLeftSection = sidebarLeftPage.section.sidebarLeft;

        sidebarLeftSection.expect.section('@sidebarChannelContainer').to.be.visible;
        const sidebarChannelContainerSection = sidebarLeftSection.section.sidebarChannelContainer;

        sidebarChannelContainerSection
            .assert.visible('@publicChannel')
            .assert.visible('@createPublicChannel')
            .assert.visible('@morePublicChannel')
            .assert.visible('@privateChannel')
            .assert.visible('@createPrivateChannel')
            .assert.visible('@directChannel')
            .assert.visible('@moreDirectChannel');
    }
};
