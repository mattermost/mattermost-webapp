// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import clone from 'clone';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import {Preferences} from 'mattermost-redux/constants';
import {getStatusesByIds} from 'mattermost-redux/actions/users';

import * as Actions from 'actions/status_actions.jsx';

jest.mock('mattermost-redux/actions/users', () => ({
    getStatusesByIds: jest.fn(() => {
        return {type: ''};
    }),
}));

const mockStore = configureStore([thunk]);

describe('actions/status_actions', () => {
    const initialState = {
        views: {
            channel: {
                postVisibility: {channel_id1: 100, channel_id2: 100},
            },
        },
        entities: {
            channels: {
                currentChannelId: 'channel_id1',
                channels: {channel_id1: {id: 'channel_id1', name: 'channel1', team_id: 'team_id1'}, channel_id2: {id: 'channel_id2', name: 'channel2', team_id: 'team_id1'}},
                myMembers: {channel_id1: {channel_id: 'channel_id1', user_id: 'current_user_id'}},
                channelsInTeam: {team_id1: ['channel_id1']},
            },
            teams: {
                currentTeamId: 'team_id1',
                teams: {
                    team_id1: {
                        id: 'team_id1',
                        name: 'team1',
                    },
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {user_id2: {id: 'user_id2', username: 'user2'}, user_id3: {id: 'user_id3', username: 'user3'}, user_id4: {id: 'user_id4', username: 'user4'}},
            },
            posts: {
                posts: {post_id1: {id: 'post_id1', user_id: 'current_user_id'}, post_id2: {id: 'post_id2', user_id: 'user_id2'}},
                postsInChannel: {channel_id1: ['post_id1', 'post_id2'], channel_id2: []},
            },
            preferences: {
                myPreferences: {
                    [Preferences.CATEGORY_DIRECT_CHANNEL_SHOW + '--user_id3']: {category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: 'user_id3', value: 'true', user_id: 'current_user_id'},
                    [Preferences.CATEGORY_DIRECT_CHANNEL_SHOW + '--user_id1']: {category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: 'user_id1', value: 'false', user_id: 'current_user_id'},
                },
            },
        },
    };

    describe('loadStatusesForChannelAndSidebar', () => {
        test('load statuses with posts in channel and user in sidebar', () => {
            const state = clone(initialState);
            const testStore = mockStore(state);
            testStore.dispatch(Actions.loadStatusesForChannelAndSidebar());
            expect(getStatusesByIds).toHaveBeenCalledWith(expect.arrayContainingExactly(['current_user_id', 'user_id2', 'user_id3']));
        });

        test('load statuses with empty channel and user in sidebar', () => {
            const state = clone(initialState);
            state.entities.channels.currentChannelId = 'channel_id2';
            const testStore = mockStore(state);
            testStore.dispatch(Actions.loadStatusesForChannelAndSidebar());
            expect(getStatusesByIds).toHaveBeenCalledWith(expect.arrayContainingExactly(['current_user_id', 'user_id3']));
        });

        test('load statuses with empty channel and no users in sidebar', () => {
            const state = clone(initialState);
            state.entities.channels.currentChannelId = 'channel_id2';
            state.entities.preferences.myPreferences = {};
            const testStore = mockStore(state);
            testStore.dispatch(Actions.loadStatusesForChannelAndSidebar());
            expect(getStatusesByIds).toHaveBeenCalledWith(expect.arrayContainingExactly(['current_user_id']));
        });
    });

    describe('loadStatusesForProfilesList', () => {
        test('load statuses for users array', () => {
            const state = clone(initialState);
            const testStore = mockStore(state);
            testStore.dispatch(Actions.loadStatusesForProfilesList([{id: 'user_id2', username: 'user2'}, {id: 'user_id4', username: 'user4'}]));
            expect(getStatusesByIds).toHaveBeenCalledWith(expect.arrayContainingExactly(['user_id2', 'user_id4']));
        });

        test('load statuses for empty users array', () => {
            const state = clone(initialState);
            const testStore = mockStore(state);
            testStore.dispatch(Actions.loadStatusesForProfilesList([]));
            expect(getStatusesByIds).not.toHaveBeenCalled();
        });

        test('load statuses for null users array', () => {
            const state = clone(initialState);
            const testStore = mockStore(state);
            testStore.dispatch(Actions.loadStatusesForProfilesList(null));
            expect(getStatusesByIds).not.toHaveBeenCalled();
        });
    });

    describe('loadStatusesForProfilesMap', () => {
        test('load statuses for users map', () => {
            const state = clone(initialState);
            const testStore = mockStore(state);
            testStore.dispatch(Actions.loadStatusesForProfilesMap({user_id2: {id: 'user_id2', username: 'user2'}, user_id3: {id: 'user_id3', username: 'user3'}, user_id4: {id: 'user_id4', username: 'user4'}}));
            expect(getStatusesByIds).toHaveBeenCalledWith(expect.arrayContainingExactly(['user_id2', 'user_id3', 'user_id4']));
        });

        test('load statuses for empty users map', () => {
            const state = clone(initialState);
            const testStore = mockStore(state);
            testStore.dispatch(Actions.loadStatusesForProfilesMap({}));
            expect(getStatusesByIds).not.toHaveBeenCalled();
        });

        test('load statuses for null users map', () => {
            const state = clone(initialState);
            const testStore = mockStore(state);
            testStore.dispatch(Actions.loadStatusesForProfilesMap(null));
            expect(getStatusesByIds).not.toHaveBeenCalled();
        });
    });
});