// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Constants} from '../utils';

const sidebarLeftPageCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@sidebarLeft', Constants.DEFAULT_WAIT);
    },
    navigateToAccountSettingsModal() {
        return this.
            click('@sidebarHeaderDropdownButton').
            section.sidebarDropdownMenu.
            click('@accountSettings');
    },
};

const sidebarHeaderDropdownButton = {selector: '#sidebarHeaderDropdownButton'};
const statusDropdown = {selector: '#status-dropdown'};
const sidebarDropdownMenu = {
    selector: '#sidebarDropdownMenu',
    elements: {
        accountSettings: {selector: '#accountSettings'},
        sendEmailInvite: {selector: '#sendEmailInvite'},
        getTeamInviteLink: {selector: '#getTeamInviteLink'},
        addUsersToTeam: {selector: '#addUsersToTeam'},
        teamSettings: {selector: '#teamSettings'},
        manageMembers: {selector: '#manageMembers'},
        createTeam: {selector: '#createTeam'},
        leaveTeam: {selector: '#leaveTeam'},
        integrations: {selector: '#Integrations'},
        systemConsole: {selector: '#systemConsole'},
        helpLink: {selector: '#helpLink'},
        keyboardShortcuts: {selector: '#keyboardShortcuts'},
        reportLink: {selector: '#reportLink'},
        nativeAppLink: {selector: '#nativeAppLink'},
        about: {selector: '#about'},
        logout: {selector: '#logout'},
    },
};
const headerInfo = {
    selector: '#headerInfo',
    elements: {
        headerUsername: {selector: '#headerUsername'},
        headerTeamName: {selector: '#headerTeamName'},
    },
};
const editStatusMenu = {
    selector: '#editStatusMenu',
    elements: {
        statusOnline: {selector: '#statusonline'},
        statusAway: {selector: '#statusaway'},
        statusOffline: {selector: '#statusoffline'},
    },
};
const sidebarChannelContainer = {
    selector: '#sidebarChannelContainer',
    elements: {
        favoriteChannel: {selector: '#favoriteChannel'},
        publicChannel: {selector: '#publicChannel'},
        createPublicChannel: {selector: '#createPublicChannel'},
        morePublicChannel: {selector: '#sidebarChannelsMore'},
        privateChannel: {selector: '#privateChannel'},
        createPrivateChannel: {selector: '#createPrivateChannel'},
        directChannel: {selector: '#directChannel'},
        moreDirectChannel: {selector: '#moreDirectMessage'},
    },
};

module.exports = {
    url: `${Constants.TEST_BASE_URL}`,
    commands: [sidebarLeftPageCommands],
    sections: {
        sidebarLeft: {
            selector: '#sidebar-left',
            sections: {
                teamHeader: {
                    selector: '#teamHeader',
                    sections: {
                        sidebarDropdownMenuContainer: {
                            selector: '#sidebarDropdownMenuContainer',
                            sections: {
                                sidebarDropdownMenu,
                            },
                            elements: {
                                sidebarHeaderDropdownButton,
                            },
                        },
                        headerInfo,
                        editStatusMenu,
                    },
                    elements: {
                        statusDropdown,
                    },
                },
                sidebarChannelContainer,
            },
            elements: {
                sidebarSwitcherButton: {selector: '#sidebarSwitcherButton'},
                unreadIndicatorTop: {selector: '#unreadIndicatorTop'},
                unreadIndicatorBottom: {selector: '#unreadIndicatorBottom'},
            },
        },
        sidebarDropdownMenu,
        headerInfo,
        editStatusMenu,
        sidebarChannelContainer,
    },
    elements: {
        sidebarHeaderDropdownButton,
        statusDropdown,
    },
};
