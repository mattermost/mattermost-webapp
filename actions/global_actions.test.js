// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';

import {closeRightHandSide, closeMenu as closeRhsMenu} from 'actions/views/rhs';
import {close as closeLhs} from 'actions/views/lhs';
import LocalStorageStore from 'stores/local_storage_store';
import {dispatch, getState} from 'stores/redux_store';

import {completeUserData, defaultRoute, toggleSideBarRightMenuAction} from 'actions/global_actions.jsx';

jest.mock('actions/views/rhs', () => ({
    closeMenu: jest.fn(),
    closeRightHandSide: jest.fn(),
}));

jest.mock('actions/views/lhs', () => ({
    close: jest.fn(),
}));

jest.mock('mattermost-redux/actions/users', () => ({
    loadMe: () => ({type: 'MOCK_RECEIVED_ME'}),
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    fetchMyChannelsAndMembers: (teamId) => ({type: 'MOCK_RECEIVED_CHANNELS_AND_MEMBERS', payload: teamId}),
}));

jest.mock('utils/channel_utils', () => ({
    getRedirectChannelNameForTeam: () => 'channel-in-team-1',
}));

jest.mock('stores/redux_store', () => {
    return {
        dispatch: jest.fn(),
        getState: jest.fn(),
    };
});

describe('actions/global_actions', () => {
    describe('completeUserData', () => {
        it('should load the user if it has no memberships', async () => {
            const mockStore = configureStore();
            const store = mockStore({
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'en',
                        },
                    },
                    teams: {
                        teams: {},
                        myMembers: {},
                    },
                    channels: {
                        myMembers: {},
                        channels: {},
                    },
                    users: {
                        currentUserId: 'user1',
                        profiles: {
                            user1: {id: 'user1'},
                        },
                    },
                },
            });

            getState.mockImplementation(store.getState);
            await completeUserData();
            expect(dispatch).toHaveBeenCalledWith({type: 'MOCK_RECEIVED_ME'});
        });

        it('should fetch channels and members for guest users', async () => {
            LocalStorageStore.setPreviousTeamId('user1', 'team1');
            const mockStore = configureStore();
            const store = mockStore({
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'en',
                        },
                    },
                    teams: {
                        teams: {
                            team1: {id: 'team1', display_name: 'Team 1', name: 'team1', delete_at: 0},
                        },
                        myMembers: {
                            team1: {},
                        },
                    },
                    channels: {
                        myMembers: {},
                        channels: {},
                    },
                    users: {
                        currentUserId: 'user1',
                        profiles: {
                            user1: {
                                id: 'user1',
                                roles: 'system_guest',
                            },
                        },
                    },
                },
            });

            getState.mockImplementation(store.getState);
            await completeUserData();
            expect(dispatch).toHaveBeenCalledWith({type: 'MOCK_RECEIVED_CHANNELS_AND_MEMBERS', payload: 'team1'});
        });

        it('should fetch channels and members for guest users when last team is no longer available', async () => {
            LocalStorageStore.setPreviousTeamId('user1', 'nonexistent');
            const mockStore = configureStore();
            const store = mockStore({
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'en',
                        },
                    },
                    teams: {
                        teams: {
                            team1: {id: 'team1', display_name: 'Team 1', name: 'team1', delete_at: 0},
                            team2: {id: 'team2', display_name: 'Team 2', name: 'team2', delete_at: 0},
                        },
                        myMembers: {
                            team1: {},
                            team2: {},
                        },
                    },
                    channels: {
                        myMembers: {},
                        channels: {},
                    },
                    users: {
                        currentUserId: 'user1',
                        profiles: {
                            user1: {
                                id: 'user1',
                                roles: 'system_guest',
                            },
                        },
                    },
                },
            });

            getState.mockImplementation(store.getState);
            await completeUserData();
            expect(dispatch).toHaveBeenCalledWith({type: 'MOCK_RECEIVED_CHANNELS_AND_MEMBERS', payload: 'team1'});
        });
    });

    describe('defaultRoute', () => {
        it('should redirect to the login if there is no user loaded', () => {
            const state = {
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'en',
                        },
                    },
                    teams: {},
                    channels: {},
                    users: {
                        currentUserId: '',
                        profiles: {},
                    },
                },
            };

            expect(defaultRoute(state)).toBe('/login');
        });

        it("should redirect to root if we haven't received the user teams yet", () => {
            const state = {
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'en',
                        },
                    },
                    teams: {},
                    channels: {},
                    users: {
                        currentUserId: 'user1',
                        profiles: {
                            user1: {id: 'user1'},
                        },
                    },
                },
                requests: {
                    teams: {
                        getMyTeams: {},
                    },
                },
            };

            expect(defaultRoute(state)).toBe('/');
        });

        it("should redirect to root if the user is a guest and they don't have channel memberships", () => {
            const state = {
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'en',
                        },
                    },
                    teams: {},
                    channels: {},
                    users: {
                        currentUserId: 'user1',
                        profiles: {
                            user1: {
                                id: 'user1',
                                roles: 'system_guest',
                            },
                        },
                    },
                },
                requests: {
                    teams: {
                        getMyTeams: {status: 'success'},
                    },
                },
            };

            expect(defaultRoute(state)).toBe('/');
        });

        it('should redirect to last team and channel if they are available', () => {
            LocalStorageStore.setPreviousTeamId('user1', 'team2');
            LocalStorageStore.setPreviousChannelName('user1', 'team2', 'channel-in-team-2');

            const state = {
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'en',
                        },
                    },
                    teams: {
                        teams: {
                            team1: {id: 'team1', display_name: 'Team 1', name: 'team1', delete_at: 0},
                            team2: {id: 'team2', display_name: 'Team 2', name: 'team2', delete_at: 0},
                        },
                        myMembers: {
                            team1: {team_id: 'team1'},
                            team2: {team_id: 'team2'},
                        },
                    },
                    channels: {
                        myMembers: {
                            'channel-in-team-1': {},
                            'channel-in-team-2': {},
                        },
                        channels: {
                            'channel-in-team-1': {
                                id: 'channel-in-team-1',
                                team_id: 'team1',
                                name: 'channel-in-team-1',
                            },
                            'channel-in-team-2': {
                                id: 'channel-in-team-2',
                                team_id: 'team2',
                                name: 'channel-in-team-2',
                            },
                        },
                    },
                    users: {
                        currentUserId: 'user1',
                        profiles: {
                            user1: {id: 'user1'},
                        },
                    },
                },
                requests: {
                    teams: {
                        getMyTeams: {status: 'success'},
                    },
                },
            };

            expect(defaultRoute(state)).toBe('/team2/channels/channel-in-team-2');
        });

        it('should redirect to last channel on first team when current team is no longer available', () => {
            LocalStorageStore.setPreviousTeamId('user1', 'nonexistent');

            const state = {
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'en',
                        },
                    },
                    teams: {
                        teams: {
                            team1: {id: 'team1', display_name: 'Team 1', name: 'team1', delete_at: 0},
                            team2: {id: 'team2', display_name: 'Team 2', name: 'team2', delete_at: 0},
                        },
                        myMembers: {
                            team1: {team_id: 'team1'},
                            team2: {team_id: 'team2'},
                        },
                    },
                    channels: {
                        myMembers: {
                            'channel-in-team-1': {},
                            'channel-in-team-2': {},
                        },
                        channels: {
                            'channel-in-team-1': {
                                id: 'channel-in-team-1',
                                team_id: 'team1',
                                name: 'channel-in-team-1',
                            },
                            'channel-in-team-2': {
                                id: 'channel-in-team-2',
                                team_id: 'team2',
                                name: 'channel-in-team-2',
                            },
                        },
                    },
                    users: {
                        currentUserId: 'user1',
                        profiles: {
                            user1: {id: 'user1'},
                        },
                    },
                },
                requests: {
                    teams: {
                        getMyTeams: {status: 'success'},
                    },
                },
            };

            expect(defaultRoute(state)).toBe('/team1/channels/channel-in-team-1');
        });

        it('should redirect to /select_team when no team is available', () => {
            const state = {
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'en',
                        },
                    },
                    teams: {
                        teams: {},
                        myMembers: {},
                    },
                    channels: {
                        myMembers: {},
                        channels: {},
                    },
                    users: {
                        currentUserId: 'user1',
                        profiles: {
                            user1: {id: 'user1'},
                        },
                    },
                },
                requests: {
                    teams: {
                        getMyTeams: {status: 'success'},
                    },
                },
            };

            expect(defaultRoute(state)).toBe('/select_team');
        });
    });

    test('toggleSideBarRightMenuAction', () => {
        const dispatchMock = () => {};
        toggleSideBarRightMenuAction()(dispatchMock);
        expect(closeRhsMenu).toHaveBeenCalled();
        expect(closeRightHandSide).toHaveBeenCalled();
        expect(closeLhs).toHaveBeenCalled();
    });
});
