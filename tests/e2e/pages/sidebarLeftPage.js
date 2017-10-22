// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../utils';

const sidebarLeftPageCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@sidebarLeft', Constants.DEFAULT_WAIT);
    }
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
                                sidebarDropdownMenu: {
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
                                        logout: {selector: '#logout'}
                                    }
                                }
                            },
                            elements: {
                                sidebarHeaderDropdownButton: {selector: '#sidebarHeaderDropdownButton'}
                            }
                        },
                        headerInfo: {
                            selector: '#headerInfo',
                            elements: {
                                headerUsername: {selector: '#headerUsername'},
                                headerTeamName: {selector: '#headerTeamName'}
                            }
                        },
                        editStatusMenu: {
                            selector: '#editStatusMenu',
                            elements: {
                                statusOnline: {selector: '#statusonline'},
                                statusAway: {selector: '#statusaway'},
                                statusOffline: {selector: '#statusoffline'}
                            }
                        }
                    },
                    elements: {
                        statusDropdown: {selector: '#status-dropdown'}
                    }
                },
                sidebarChannelContainer: {
                    selector: '#sidebarChannelContainer',
                    elements: {
                        favoriteChannel: {selector: '#favoriteChannel'},
                        publicChannel: {selector: '#publicChannel'},
                        createPublicChannel: {selector: '#createPublicChannel'},
                        morePublicChannel: {selector: '#sidebarChannelsMore'},
                        privateChannel: {selector: '#privateChannel'},
                        createPrivateChannel: {selector: '#createPrivateChannel'},
                        directChannel: {selector: '#directChannel'},
                        moreDirectChannel: {selector: '#moreDirectMessage'}
                    }
                }
            },
            elements: {
                sidebarSwitcherButton: {selector: '#sidebarSwitcherButton'},
                unreadIndicatorTop: {selector: '#unreadIndicatorTop'},
                unreadIndicatorBottom: {selector: '#unreadIndicatorBottom'}
            }
        }
    }
};
