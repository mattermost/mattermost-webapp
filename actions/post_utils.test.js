// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {Posts} from 'mattermost-redux/constants';

import * as PostActionsUtils from 'actions/post_utils';
import {Constants} from 'utils/constants';

const mockStore = configureStore([thunk]);

jest.mock('mattermost-redux/actions/channels', () => ({
    markChannelAsUnread: (...args) => ({type: 'MOCK_MARK_CHANNEL_AS_UNREAD', args}),
    markChannelAsRead: (...args) => ({type: 'MOCK_MARK_CHANNEL_AS_READ', args}),
    markChannelAsViewed: (...args) => ({type: 'MOCK_MARK_CHANNEL_AS_VIEWED', args}),
}));

const EMPTY_ACTION = [];
const MARK_CHANNEL_AS_UNREAD = {
    args: ['team_id', 'current_channel_id', ['current_user_id']],
    type: 'MOCK_MARK_CHANNEL_AS_UNREAD',
};
const MARK_CHANNEL_AS_READ = {
    args: ['current_channel_id', null, false],
    type: 'MOCK_MARK_CHANNEL_AS_READ',
};
const MARK_CHANNEL_AS_VIEWED = {
    args: ['current_channel_id'],
    type: 'MOCK_MARK_CHANNEL_AS_VIEWED',
};
const RECEIVED_POSTS = {
    channelId: 'current_channel_id',
    data: {order: [], posts: {new_post_id: {channel_id: 'current_channel_id', id: 'new_post_id', message: 'new message', type: ''}}},
    type: 'RECEIVED_POSTS',
};
const INCREASED_POST_VISIBILITY = {amount: 1, data: 'current_channel_id', type: 'INCREASE_POST_VISIBILITY'};

function getReceivedPosts(post) {
    const receivedPosts = {...RECEIVED_POSTS};
    if (post) {
        receivedPosts.data.posts[post.id] = post;
    }

    return receivedPosts;
}

describe('actions/post_utils', () => {
    const latestPost = {
        id: 'latest_post_id',
        user_id: 'current_user_id',
        message: 'test msg',
        channel_id: 'current_channel_id',
        type: 'normal,',
    };
    const initialState = {
        entities: {
            posts: {
                posts: {
                    [latestPost.id]: latestPost,
                },
                postsInChannel: {
                    current_channel_id: [latestPost.id],
                },
                postsInThread: {},
                messagesHistory: {
                    index: {
                        [Posts.MESSAGE_TYPES.COMMENT]: 0,
                    },
                    messages: ['test message'],
                },
            },
            channels: {
                currentChannelId: 'current_channel_id',
                myMembers: {
                    [latestPost.channel_id]: {
                        channel_id: 'current_channel_id',
                        user_id: 'current_user_id',
                        roles: 'channel_role',
                    },
                },
                channels: {
                    current_channel_id: {team_id: 'team_id'},
                },
            },
            preferences: {
                myPreferences: {
                    'display_settings--name_format': {
                        category: 'display_settings',
                        name: 'name_format',
                        user_id: 'current_user_id',
                        value: 'username',
                    },
                },
            },
            teams: {
                currentTeamId: 'team-1',
                teams: {
                    team_id: {
                        id: 'team_id',
                        name: 'team-1',
                        displayName: 'Team 1',
                    },
                },
                myMembers: {
                    'team-1': {roles: 'team_role'},
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {roles: 'system_role'},
                },
            },
            general: {
                license: {IsLicensed: 'false'},
                serverVersion: '5.4.0',
                config: {PostEditTimeLimit: -1},
            },
            roles: {
                roles: {
                    system_role: {
                        permissions: ['edit_post'],
                    },
                    team_role: {
                        permissions: [],
                    },
                    channel_role: {
                        permissions: [],
                    },
                },
            },
        },
        views: {
            posts: {
                editingPost: {},
            },
            channel: {
                loadingPosts: {},
                postVisibility: {current_channel_id: 60},
            },
        },
    };

    test('completePostReceive', async () => {
        const testStore = await mockStore(initialState);
        const newPost = {id: 'new_post_id', channel_id: 'current_channel_id', message: 'new message', type: Constants.PostTypes.ADD_TO_CHANNEL};
        const websocketProps = {team_id: 'team_id', mentions: ['current_user_id']};

        await testStore.dispatch(PostActionsUtils.completePostReceive(newPost, websocketProps));
        expect(testStore.getActions()).toEqual([INCREASED_POST_VISIBILITY, getReceivedPosts(newPost)]);
    });

    test('lastPostActions', async () => {
        const testStore = await mockStore(initialState);
        const newPost = {id: 'new_post_id', channel_id: 'current_channel_id', message: 'new message', type: Constants.PostTypes.ADD_TO_CHANNEL};
        const websocketProps = {team_id: 'team_id', mentions: ['current_user_id']};

        await testStore.dispatch(PostActionsUtils.lastPostActions(newPost, websocketProps));
        expect(testStore.getActions()).toEqual([INCREASED_POST_VISIBILITY, getReceivedPosts(newPost)]);
    });

    test('setChannelReadAndView', async () => {
        let testStore = await mockStore(initialState);
        const newPost = {id: 'new_post_id', channel_id: 'current_channel_id', message: 'new message', type: Constants.PostTypes.ADD_TO_CHANNEL};
        const websocketProps = {team_id: 'team_id', mentions: ['current_user_id']};

        await testStore.dispatch(PostActionsUtils.setChannelReadAndView(newPost, websocketProps));
        expect(testStore.getActions()).toEqual(EMPTY_ACTION);

        testStore = await mockStore(initialState);
        newPost.type = '';
        await testStore.dispatch(PostActionsUtils.setChannelReadAndView(newPost, websocketProps));
        expect(testStore.getActions()).toEqual([MARK_CHANNEL_AS_UNREAD]);

        testStore = await mockStore(initialState);
        newPost.user_id = 'current_user_id';
        await testStore.dispatch(PostActionsUtils.setChannelReadAndView(newPost, websocketProps));
        expect(testStore.getActions()).toEqual([MARK_CHANNEL_AS_READ, MARK_CHANNEL_AS_VIEWED]);
    });

    test('increasePostVisibility', async () => {
        const testStore = await mockStore(initialState);

        await testStore.dispatch(Actions.increasePostVisibility('current_channel_id'));
        expect(testStore.getActions()).toEqual([
            {
                meta: {batch: true},
                payload: [
                    {channelId: 'current_channel_id', data: true, type: 'LOADING_POSTS'},
                    {amount: 30, data: 'current_channel_id', type: 'INCREASE_POST_VISIBILITY'},
                ],
                type: 'BATCHING_REDUCER.BATCH',
            },
            {args: ['current_channel_id', 2, 30], type: 'MOCK_GET_POSTS'},
            {channelId: 'current_channel_id', data: false, type: 'LOADING_POSTS'},
        ]);

        await testStore.dispatch(Actions.increasePostVisibility('current_channel_id', 'latest_post_id'));
        expect(testStore.getActions()).toEqual([
            {
                meta: {batch: true},
                payload: [
                    {channelId: 'current_channel_id', data: true, type: 'LOADING_POSTS'},
                    {amount: 30, data: 'current_channel_id', type: 'INCREASE_POST_VISIBILITY'},
                ],
                type: 'BATCHING_REDUCER.BATCH',
            },
            {args: ['current_channel_id', 2, 30], type: 'MOCK_GET_POSTS'},
            {channelId: 'current_channel_id', data: false, type: 'LOADING_POSTS'},
            {
                meta: {batch: true},
                payload: [
                    {channelId: 'current_channel_id', data: true, type: 'LOADING_POSTS'},
                    {amount: 30, data: 'current_channel_id', type: 'INCREASE_POST_VISIBILITY'},
                ],
                type: 'BATCHING_REDUCER.BATCH',
            },
            {
                args: ['current_channel_id', 'latest_post_id', 2, 30],
                type: 'MOCK_GET_POSTS_BEFORE',
            },
            {channelId: 'current_channel_id', data: false, type: 'LOADING_POSTS'}]);
    });
});
