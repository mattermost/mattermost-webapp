// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {Preferences, General} from 'mattermost-redux/constants';
import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';

import * as UserActions from 'actions/user_actions';
import {getState} from 'stores/redux_store';
import TestHelper from 'tests/helpers/client-test-helper';
import {trackEvent} from 'actions/telemetry_actions.jsx';

const mockStore = configureStore([thunk]);

jest.mock('mattermost-redux/actions/users', () => {
    const original = jest.requireActual('mattermost-redux/actions/users');
    return {
        ...original,
        searchProfiles: (...args) => ({type: 'MOCK_SEARCH_PROFILES', args}),
        getProfilesInTeam: (...args) => ({type: 'MOCK_GET_PROFILES_IN_TEAM', args}),
        getProfilesInChannel: (...args) => ({type: 'MOCK_GET_PROFILES_IN_CHANNEL', args, data: [{id: 'user_1'}]}),
        getProfilesInGroupChannels: (...args) => ({type: 'MOCK_GET_PROFILES_IN_GROUP_CHANNELS', args}),
        getStatusesByIds: (...args) => ({type: 'MOCK_GET_STATUSES_BY_ID', args}),
    };
});

jest.mock('mattermost-redux/selectors/entities/channels', () => {
    const GeneralTypes = jest.requireActual('mattermost-redux/constants').General;
    const original = jest.requireActual('mattermost-redux/selectors/entities/channels');
    const mockDmGmUsersInLhs = [{id: 'gmChannel', type: GeneralTypes.GM_CHANNEL}, {id: 'dmChannel', type: GeneralTypes.DM_CHANNEL}];

    return {
        ...original,
        getDirectChannels: jest.fn().mockReturnValue(mockDmGmUsersInLhs),
    };
});

jest.mock('mattermost-redux/actions/teams', () => {
    const original = jest.requireActual('mattermost-redux/actions/teams');
    return {
        ...original,
        getTeamMembersByIds: (...args) => ({type: 'MOCK_GET_TEAM_MEMBERS_BY_IDS', args}),
    };
});

jest.mock('mattermost-redux/actions/channels', () => {
    const original = jest.requireActual('mattermost-redux/actions/channels');
    return {
        ...original,
        getChannelMembersByIds: (...args) => ({type: 'MOCK_GET_CHANNEL_MEMBERS_BY_IDS', args}),
    };
});

jest.mock('mattermost-redux/actions/preferences', () => {
    const original = jest.requireActual('mattermost-redux/actions/preferences');
    return {
        ...original,
        deletePreferences: (...args) => ({type: 'MOCK_DELETE_PREFERENCES', args}),
        savePreferences: (...args) => ({type: 'MOCK_SAVE_PREFERENCES', args}),
    };
});

jest.mock('stores/redux_store', () => {
    return {
        dispatch: jest.fn(),
        getState: jest.fn(),
    };
});

jest.mock('actions/telemetry_actions.jsx', () => {
    const original = jest.requireActual('actions/telemetry_actions.jsx');
    return {
        ...original,
        trackEvent: jest.fn(),
    };
});

describe('Actions.User', () => {
    const initialState = {
        entities: {
            channels: {
                currentChannelId: 'current_channel_id',
                myMembers: {
                    current_channel_id: {
                        channel_id: 'current_channel_id',
                        user_id: 'current_user_id',
                        roles: 'channel_role',
                        mention_count: 1,
                        msg_count: 9,
                    },
                },
                channels: {
                    current_channel_id: {
                        total_msg_count: 10,
                        team_id: 'team_1',
                    },
                },
                channelsInTeam: {
                    team_1: ['current_channel_id'],
                },
                membersInChannel: {
                    current_channel_id: {
                        current_user_id: {id: 'current_user_id'},
                    },
                },
            },
            general: {
                config: {
                    ExperimentalChannelSidebarOrganization: 'default_on',
                },
            },
            preferences: {
                myPreferences: {
                    'theme--team_1': {
                        category: 'theme',
                        name: 'team_1',
                        user_id: 'current_user_id',
                        value: JSON.stringify(Preferences.THEMES.mattermostDark),
                    },
                },
            },
            teams: {
                currentTeamId: 'team_1',
                teams: {
                    team_1: {
                        id: 'team_1',
                        name: 'team-1',
                        displayName: 'Team 1',
                    },
                    team_2: {
                        id: 'team_2',
                        name: 'team-2',
                        displayName: 'Team 2',
                    },
                },
                myMembers: {
                    team_1: {roles: 'team_role'},
                    team_2: {roles: 'team_role'},
                },
                membersInTeam: {
                    team_1: {
                        current_user_id: {id: 'current_user_id'},
                    },
                    team_2: {
                        current_user_id: {id: 'current_user_id'},
                    },
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profilesInChannel: {
                    group_channel_2: ['user_1', 'user_2'],
                },
            },
        },
        storage: {
            storage: {},
        },
        views: {
            channel: {
                lastViewedChannel: null,
            },
            channelSidebar: {
                unreadFilterEnabled: false,
            },
        },
    };

    test('loadProfilesAndStatusesInChannel', async () => {
        const testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadProfilesAndStatusesInChannel('channel_1', 0, 60, 'status', {}));
        const actualActions = testStore.getActions();
        expect(actualActions[0].args).toEqual(['channel_1', 0, 60, 'status', {}]);
        expect(actualActions[0].type).toEqual('MOCK_GET_PROFILES_IN_CHANNEL');
        expect(actualActions[1].args).toEqual([['user_1']]);
        expect(actualActions[1].type).toEqual('MOCK_GET_STATUSES_BY_ID');
    });

    test('loadProfilesAndTeamMembers', async () => {
        const expectedActions = [{type: 'MOCK_GET_PROFILES_IN_TEAM', args: ['team_1', 0, 60, '', {}]}];

        let testStore = await mockStore({});
        await testStore.dispatch(UserActions.loadProfilesAndTeamMembers(0, 60, 'team_1', {}));
        let actualActions = testStore.getActions();
        expect(actualActions[0].args).toEqual(expectedActions[0].args);
        expect(actualActions[0].type).toEqual(expectedActions[0].type);

        testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadProfilesAndTeamMembers(0, 60, undefined, {}));
        actualActions = testStore.getActions();
        expect(actualActions[0].args).toEqual(expectedActions[0].args);
        expect(actualActions[0].type).toEqual(expectedActions[0].type);
    });

    test('loadProfilesAndReloadChannelMembers', async () => {
        const expectedActions = [{type: 'MOCK_GET_PROFILES_IN_CHANNEL', args: ['current_channel_id', 0, 60, 'sort', {}]}];

        const testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadProfilesAndReloadChannelMembers(0, 60, 'current_channel_id', 'sort', {}));
        const actualActions = testStore.getActions();
        expect(actualActions[0].args).toEqual(expectedActions[0].args);
        expect(actualActions[0].type).toEqual(expectedActions[0].type);
    });

    test('loadProfilesAndTeamMembersAndChannelMembers', async () => {
        const expectedActions = [{type: 'MOCK_GET_PROFILES_IN_CHANNEL', args: ['current_channel_id', 0, 60, '', undefined]}];

        let testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadProfilesAndTeamMembersAndChannelMembers(0, 60, 'team_1', 'current_channel_id'));
        let actualActions = testStore.getActions();
        expect(actualActions[0].args).toEqual(expectedActions[0].args);
        expect(actualActions[0].type).toEqual(expectedActions[0].type);

        testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadProfilesAndTeamMembersAndChannelMembers(0, 60));
        actualActions = testStore.getActions();
        expect(actualActions[0].args).toEqual(expectedActions[0].args);
        expect(actualActions[0].type).toEqual(expectedActions[0].type);
    });

    test('loadTeamMembersForProfilesList', async () => {
        const expectedActions = [{args: ['team_1', ['other_user_id']], type: 'MOCK_GET_TEAM_MEMBERS_BY_IDS'}];

        // should call getTeamMembersByIds since 'other_user_id' is not loaded yet
        let testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadTeamMembersForProfilesList([{id: 'other_user_id'}], 'team_1'));
        expect(testStore.getActions()).toEqual(expectedActions);

        // should not call getTeamMembersByIds since 'current_user_id' is already loaded
        testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadTeamMembersForProfilesList([{id: 'current_user_id'}], 'team_1'));
        expect(testStore.getActions()).toEqual([]);

        // should call getTeamMembersByIds when reloadAllMembers = true even though 'current_user_id' is already loaded
        testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadTeamMembersForProfilesList([{id: 'current_user_id'}], 'team_1', true));
        expect(testStore.getActions()).toEqual([{args: ['team_1', ['current_user_id']], type: 'MOCK_GET_TEAM_MEMBERS_BY_IDS'}]);

        // should not call getTeamMembersByIds since no or empty profile is passed
        testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadTeamMembersForProfilesList([], 'team_1'));
        expect(testStore.getActions()).toEqual([]);
    });

    test('loadTeamMembersAndChannelMembersForProfilesList', async () => {
        const expectedActions = [
            {args: ['team_1', ['other_user_id']], type: 'MOCK_GET_TEAM_MEMBERS_BY_IDS'},
            {args: ['current_channel_id', ['other_user_id']], type: 'MOCK_GET_CHANNEL_MEMBERS_BY_IDS'},
        ];

        // should call getTeamMembersByIds and getChannelMembersByIds since 'other_user_id' is not loaded yet
        let testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadTeamMembersAndChannelMembersForProfilesList([{id: 'other_user_id'}], 'team_1', 'current_channel_id'));
        expect(testStore.getActions()).toEqual(expectedActions);

        // should not call getTeamMembersByIds/getChannelMembersByIds since 'current_user_id' is already loaded
        testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadTeamMembersForProfilesList([{id: 'current_user_id'}], 'team_1', 'current_channel_id'));
        expect(testStore.getActions()).toEqual([]);

        // should not call getTeamMembersByIds/getChannelMembersByIds since no or empty profile is passed
        testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadTeamMembersForProfilesList([], 'team_1', 'current_channel_id'));
        expect(testStore.getActions()).toEqual([]);
    });

    test('loadChannelMembersForProfilesList', async () => {
        const expectedActions = [{args: ['current_channel_id', ['other_user_id']], type: 'MOCK_GET_CHANNEL_MEMBERS_BY_IDS'}];

        // should call getChannelMembersByIds since 'other_user_id' is not loaded yet
        let testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadChannelMembersForProfilesList([{id: 'other_user_id'}], 'current_channel_id'));
        expect(testStore.getActions()).toEqual(expectedActions);

        // should not call getChannelMembersByIds since 'current_user_id' is already loaded
        testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadChannelMembersForProfilesList([{id: 'current_user_id'}], 'current_channel_id'));
        expect(testStore.getActions()).toEqual([]);

        // should not call getChannelMembersByIds since no or empty profile is passed
        testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadChannelMembersForProfilesList([], 'current_channel_id'));
        expect(testStore.getActions()).toEqual([]);
    });

    test('loadProfilesForGroupChannels', async () => {
        const mockedGroupChannels = [{id: 'group_channel_1'}, {id: 'group_channel_2'}];

        // as users in group_channel_2 are already loaded, it should only try to load group_channel_1
        const expectedActions = [{args: [['group_channel_1']], type: 'MOCK_GET_PROFILES_IN_GROUP_CHANNELS'}];
        const testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadProfilesForGroupChannels(mockedGroupChannels));
        expect(testStore.getActions()).toEqual(expectedActions);
    });

    test('searchProfilesAndChannelMembers', async () => {
        const expectedActions = [{type: 'MOCK_SEARCH_PROFILES', args: ['current_channel_id', 'term']}];

        const testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.searchProfilesAndChannelMembers('current_channel_id', 'term'));
        const actualActions = testStore.getActions();
        expect(actualActions[0].args).toEqual(expectedActions[0].args);
        expect(actualActions[0].type).toEqual(expectedActions[0].type);
    });

    describe('getGMsForLoading', () => {
        const gmChannel1 = {id: 'gmChannel1', type: General.GM_CHANNEL, delete_at: 0};
        const gmChannel2 = {id: 'gmChannel2', type: General.GM_CHANNEL, delete_at: 0};

        const dmsCategory = {id: 'dmsCategory', type: CategoryTypes.DIRECT_MESSAGES, channel_ids: [gmChannel1.id, gmChannel2.id]};

        const baseState = {
            ...initialState,
            entities: {
                ...initialState.entities,
                channelCategories: {
                    ...initialState.entities.channelCategories,
                    byId: {
                        dmsCategory,
                    },
                    orderByTeam: {
                        [initialState.entities.teams.currentTeamId]: [dmsCategory.id],
                    },
                },
                channels: {
                    ...initialState.entities.channels,
                    channels: {
                        ...initialState.entities.channels,
                        gmChannel1,
                        gmChannel2,
                    },
                    myMembers: {
                        ...initialState.entities.myMembers,
                        [gmChannel1.id]: {last_viewed_at: 1000},
                        [gmChannel2.id]: {last_viewed_at: 2000},
                    },
                },
                general: {
                    ...initialState.entities.general,
                    config: {
                        ...initialState.entities.general.config,
                        ExperimentalChannelSidebarOrganization: General.ALWAYS_ON,
                    },
                },
                preferences: {
                    ...initialState.entities.preferences,
                    myPreferences: {
                        ...initialState.entities.preferences.myPreferences,
                        [getPreferenceKey(Preferences.CATEGORY_SIDEBAR_SETTINGS, Preferences.LIMIT_VISIBLE_DMS_GMS)]: {value: '10'},
                        [getPreferenceKey(Preferences.CATEGORY_GROUP_CHANNEL_SHOW, gmChannel1.id)]: {value: 'true'},
                        [getPreferenceKey(Preferences.CATEGORY_GROUP_CHANNEL_SHOW, gmChannel2.id)]: {value: 'true'},
                    },
                },
            },
        };

        test('should not return autoclosed GMs', () => {
            let state = baseState;

            expect(UserActions.getGMsForLoading(state)).toEqual([gmChannel1, gmChannel2]);

            state = {
                ...state,
                entities: {
                    ...state.entities,
                    preferences: {
                        ...state.entities.preferences,
                        myPreferences: {
                            ...state.entities.preferences.myPreferences,
                            [getPreferenceKey(Preferences.CATEGORY_SIDEBAR_SETTINGS, Preferences.LIMIT_VISIBLE_DMS_GMS)]: {value: '1'},
                        },
                    },
                },
            };

            expect(UserActions.getGMsForLoading(state)).toEqual([gmChannel2]);

            state = {
                ...state,
                entities: {
                    ...state.entities,
                    channels: {
                        ...state.entities.channels,
                        myMembers: {
                            ...state.entities.channels.myMembers,
                            [gmChannel1.id]: {last_viewed_at: 3000},
                        },
                    },
                },
            };

            expect(UserActions.getGMsForLoading(state)).toEqual([gmChannel1]);
        });

        test('should not return manually closed GMs', () => {
            let state = baseState;

            expect(UserActions.getGMsForLoading(state)).toEqual([gmChannel1, gmChannel2]);

            state = {
                ...state,
                entities: {
                    ...state.entities,
                    preferences: {
                        ...state.entities.preferences,
                        myPreferences: {
                            ...state.entities.preferences.myPreferences,
                            [getPreferenceKey(Preferences.CATEGORY_GROUP_CHANNEL_SHOW, gmChannel1.id)]: {value: 'false'},
                        },
                    },
                },
            };

            expect(UserActions.getGMsForLoading(state)).toEqual([gmChannel2]);

            state = {
                ...state,
                entities: {
                    ...state.entities,
                    preferences: {
                        ...state.entities.preferences,
                        myPreferences: {
                            ...state.entities.preferences.myPreferences,
                            [getPreferenceKey(Preferences.CATEGORY_GROUP_CHANNEL_SHOW, gmChannel2.id)]: {value: 'false'},
                        },
                    },
                },
            };

            expect(UserActions.getGMsForLoading(state)).toEqual([]);
        });

        test('should return GMs that are in custom categories, even if they would be automatically hidden in the DMs category', () => {
            const gmChannel3 = {id: 'gmChannel3', type: General.GM_CHANNEL, delete_at: 0};
            const customCategory = {id: 'customCategory', type: CategoryTypes.CUSTOM, channel_ids: [gmChannel3.id]};

            let state = {
                ...baseState,
                entities: {
                    ...baseState.entities,
                    channelCategories: {
                        ...baseState.entities.channelCategories,
                        byId: {
                            ...baseState.entities.channelCategories.byId,
                            customCategory,
                        },
                        orderByTeam: {
                            ...baseState.entities.channelCategories.orderByTeam,
                            [baseState.entities.teams.currentTeamId]: [customCategory.id, dmsCategory.id],
                        },
                    },
                    channels: {
                        ...baseState.entities.channels,
                        channels: {
                            ...baseState.entities.channels.channels,
                            gmChannel3,
                        },
                        myMembers: {
                            ...baseState.entities.channels.myMembers,
                            [gmChannel3.id]: {last_viewed_at: 500},
                        },
                    },
                    preferences: {
                        ...baseState.entities.preferences,
                        myPreferences: {
                            ...baseState.entities.preferences.myPreferences,
                            [getPreferenceKey(Preferences.CATEGORY_GROUP_CHANNEL_SHOW, gmChannel3.id)]: {value: 'true'},
                        },
                    },
                },
            };

            expect(UserActions.getGMsForLoading(state)).toEqual([gmChannel3, gmChannel1, gmChannel2]);

            state = {
                ...state,
                entities: {
                    ...state.entities,
                    preferences: {
                        ...state.entities.preferences,
                        myPreferences: {
                            ...state.entities.preferences.myPreferences,
                            [getPreferenceKey(Preferences.CATEGORY_SIDEBAR_SETTINGS, Preferences.LIMIT_VISIBLE_DMS_GMS)]: {value: '1'},
                        },
                    },
                },
            };

            expect(UserActions.getGMsForLoading(state)).toEqual([gmChannel3, gmChannel2]);

            state = {
                ...state,
                entities: {
                    ...state.entities,
                    preferences: {
                        ...state.entities.preferences,
                        myPreferences: {
                            ...state.entities.preferences.myPreferences,
                            [getPreferenceKey(Preferences.CATEGORY_SIDEBAR_SETTINGS, Preferences.LIMIT_VISIBLE_DMS_GMS)]: {value: '0'},
                        },
                    },
                },
            };

            expect(UserActions.getGMsForLoading(state)).toEqual([gmChannel3]);
        });
    });

    test('Should call p-queue APIs on loadProfilesForGM', async () => {
        const gmChannel = {id: 'gmChannel', type: General.GM_CHANNEL, team_id: '', delete_at: 0};
        UserActions.queue.add = jest.fn().mockReturnValue(jest.fn());
        UserActions.queue.onEmpty = jest.fn();

        const user = TestHelper.fakeUser();

        const profiles = {
            [user.id]: user,
        };

        const channels = {
            [gmChannel.id]: gmChannel,
        };

        const channelsInTeam = {
            '': [gmChannel.id],
        };

        const myMembers = {
            [gmChannel.id]: {},
        };

        const dmsCategory = {id: 'dmsCategory', type: CategoryTypes.DIRECT_MESSAGES, channel_ids: [gmChannel.id]};

        const state = {
            entities: {
                users: {
                    currentUserId: 'current_user_id',
                    profiles,
                    statuses: {},
                    profilesInChannel: {
                        [gmChannel.id]: new Set(['current_user_id']),
                    },
                },
                teams: {
                    currentTeamId: 'team_1',
                },
                posts: {
                    posts: {
                        post_id: {id: 'post_id'},
                    },
                    postsInChannel: {},
                },
                channelCategories: {
                    byId: {
                        dmsCategory,
                    },
                    orderByTeam: {
                        team_1: [dmsCategory.id],
                    },
                },
                channels: {
                    channels,
                    channelsInTeam,
                    myMembers,
                },
                preferences: {
                    myPreferences: {
                        [getPreferenceKey(Preferences.CATEGORY_GROUP_CHANNEL_SHOW, gmChannel.id)]: {value: 'true'},
                    },
                },
                general: {
                    config: {},
                },
            },
            storage: {
                storage: {},
            },
            views: {
                channel: {
                    lastViewedChannel: null,
                },
                channelSidebar: {
                    unreadFilterEnabled: false,
                },
            },
        };

        const testStore = mockStore(state);
        getState.mockImplementation(testStore.getState);

        await UserActions.loadProfilesForGM();
        expect(UserActions.queue.onEmpty).toHaveBeenCalled();
        expect(UserActions.queue.add).toHaveBeenCalled();
    });

    test('trackDMGMOpenChannels', async () => {
        const testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.trackDMGMOpenChannels());
        expect(trackEvent).toHaveBeenCalledWith('ui', 'LHS_DM_GM_Count', {count: 2});
    });
});
