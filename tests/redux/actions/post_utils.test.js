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
                myMembers: {[latestPost.channel_id]: {channel_id: 'current_channel_id', user_id: 'current_user_id'}},
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
            },
            users: {
                currentUserId: 'current_user_id',
            },
            general: {license: {IsLicensed: 'false'}},
        },
        views: {
            posts: {
                editingPost: {},
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
});
