// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {Preferences, General} from 'mattermost-redux/constants';
import channelCategories from 'mattermost-redux/selectors/entities/channel_categories';
import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';

import * as UserActions from 'actions/user_actions';
import {getState} from 'stores/redux_store';
import TestHelper from 'tests/helpers/client-test-helper';
import {trackEvent} from 'actions/telemetry_actions.jsx';

const mockStore = configureStore([thunk]);

const mockChannelsObj1 = [{id: 'gmChannel1', type: General.GM_CHANNEL}];
const mockChannelsObj2 = [{id: 'gmChannel', type: General.GM_CHANNEL}];

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

jest.mock('mattermost-redux/selectors/entities/channel_categories', () => {
    const GeneralTypes = jest.requireActual('mattermost-redux/constants').General;
    const original = jest.requireActual('mattermost-redux/selectors/entities/channel_categories');

    const mockChannelsObj = [{id: 'gmChannel', type: GeneralTypes.GM_CHANNEL}];
    const mockFunc = jest.fn();

    return {
        ...original,
        makeFilterAutoclosedDMs: jest.fn().mockReturnValue(mockFunc),
        makeFilterManuallyClosedDMs: () => jest.fn().mockReturnValue(mockChannelsObj),
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

    test('filterGMsDMs', () => {
        const filteredResults = UserActions.filterGMsDMs(initialState, mockChannelsObj1);
        expect(channelCategories.makeFilterAutoclosedDMs()).toHaveBeenCalledWith(initialState, mockChannelsObj1, CategoryTypes.DIRECT_MESSAGES);
        expect(filteredResults).toEqual(mockChannelsObj2);
    });

    test('Should call p-queue APIs on loadProfilesForGM', async () => {
        const gmChannel = {id: 'gmChannel', type: General.GM_CHANNEL, team_id: ''};
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
                channels: {
                    channels,
                    channelsInTeam,
                    myMembers,
                },
                preferences: {
                    myPreferences: {},
                },
                general: {
                    config: {},
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
