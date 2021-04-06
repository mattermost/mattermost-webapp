// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {receivedNewPost} from 'mattermost-redux/actions/posts';
import {Posts} from 'mattermost-redux/constants';

import * as NewPostActions from 'actions/new_post';
import {Constants} from 'utils/constants';

const mockStore = configureStore([thunk]);

jest.mock('mattermost-redux/actions/channels', () => ({
    markChannelAsUnread: (...args) => ({type: 'MOCK_MARK_CHANNEL_AS_UNREAD', args}),
    markChannelAsRead: (...args) => ({type: 'MOCK_MARK_CHANNEL_AS_READ', args}),
    markChannelAsViewed: (...args) => ({type: 'MOCK_MARK_CHANNEL_AS_VIEWED', args}),
}));

const POST_CREATED_TIME = Date.now();

// This mocks the Date.now() function so it returns a constant value
global.Date.now = jest.fn(() => POST_CREATED_TIME);

const INCREASED_POST_VISIBILITY = {amount: 1, data: 'current_channel_id', type: 'INCREASE_POST_VISIBILITY'};
const STOP_TYPING = {type: 'stop_typing', data: {id: 'current_channel_idundefined', now: POST_CREATED_TIME, userId: 'some_user_id'}};

describe('actions/new_post', () => {
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
                    current_channel_id: [
                        {order: [latestPost.id], recent: true},
                    ],
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
                channels: {
                    current_channel_id: {id: 'current_channel_id'},
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
            },
            users: {
                currentUserId: 'current_user_id',
            },
            general: {
                license: {IsLicensed: 'false'},
                config: {
                    TeammateNameDisplay: 'username',
                },
            },
            preferences: {
                myPreferences: {},
            },
        },
        views: {
            posts: {
                editingPost: {},
            },
        },
    };

    test('completePostReceive', async () => {
        const testStore = await mockStore(initialState);
        const newPost = {id: 'new_post_id', channel_id: 'current_channel_id', message: 'new message', type: Constants.PostTypes.ADD_TO_CHANNEL, user_id: 'some_user_id', create_at: POST_CREATED_TIME, props: {addedUserId: 'other_user_id'}};
        const websocketProps = {team_id: 'team_id', mentions: ['current_user_id']};

        await testStore.dispatch(NewPostActions.completePostReceive(newPost, websocketProps));
        expect(testStore.getActions()).toEqual([
            INCREASED_POST_VISIBILITY,
            {
                meta: {batch: true},
                payload: [receivedNewPost(newPost), STOP_TYPING],
                type: 'BATCHING_REDUCER.BATCH',
            },
        ]);
    });

    describe('setChannelReadAndViewed', () => {
        test('should mark channel as read when viewing channel', async () => {
            const channelId = 'channel';
            const currentUserId = 'user';

            const post1 = {id: 'post1', channel_id: channelId, create_at: 1000};
            const post2 = {id: 'post2', channel_id: channelId, create_at: 2000};

            const testStore = await mockStore({
                entities: {
                    channels: {
                        currentChannelId: channelId,
                        manuallyUnread: {},
                        myMembers: {
                            [channelId]: {channel_id: channelId, last_viewed_at: 0, roles: ''},
                        },
                        channels: {
                            [channelId]: {id: channelId},
                        },
                    },
                    posts: {
                        posts: {
                            [post1.id]: post1,
                        },
                    },
                    users: {
                        currentUserId,
                    },
                    general: {
                        config: {
                            test: true,
                        },
                    },
                    preferences: {
                        myPreferences: {},
                    },
                },
            });

            window.isActive = true;

            await testStore.dispatch(NewPostActions.setChannelReadAndViewed(post2, {}, false));

            expect(testStore.getActions()).toEqual([{
                type: 'MOCK_MARK_CHANNEL_AS_READ',
                args: [channelId, undefined, true],
            }, {
                type: 'MOCK_MARK_CHANNEL_AS_VIEWED',
                args: [channelId],
            }]);
        });

        test('should mark channel as unread when not actively viewing channel', async () => {
            const channelId = 'channel';
            const currentUserId = 'user';

            const post1 = {id: 'post1', channel_id: channelId, create_at: 1000};
            const post2 = {id: 'post2', channel_id: channelId, create_at: 2000};

            const testStore = await mockStore({
                entities: {
                    channels: {
                        currentChannelId: channelId,
                        manuallyUnread: {},
                        myMembers: {
                            [channelId]: {channel_id: channelId, last_viewed_at: 0, roles: ''},
                        },
                        channels: {
                            [channelId]: {id: channelId},
                        },
                    },
                    posts: {
                        posts: {
                            [post1.id]: post1,
                        },
                    },
                    users: {
                        currentUserId,
                    },
                    general: {
                        config: {
                            test: true,
                        },
                    },
                    preferences: {
                        myPreferences: {},
                    },
                },
            });

            window.isActive = false;

            await testStore.dispatch(NewPostActions.setChannelReadAndViewed(post2, {}, false));

            expect(testStore.getActions()).toEqual([{
                type: 'MOCK_MARK_CHANNEL_AS_UNREAD',
                args: [undefined, channelId, undefined, false],
            }]);
        });

        test('should not mark channel as read when not viewing channel', async () => {
            const channelId = 'channel1';
            const otherChannelId = 'channel2';
            const currentUserId = 'user';

            const post1 = {id: 'post1', channel_id: channelId, create_at: 1000};
            const post2 = {id: 'post2', channel_id: channelId, create_at: 2000};

            const testStore = await mockStore({
                entities: {
                    channels: {
                        currentChannelId: otherChannelId,
                        manuallyUnread: {},
                        myMembers: {
                            [channelId]: {channel_id: channelId, last_viewed_at: 500, roles: ''},
                            [otherChannelId]: {channel_id: otherChannelId, last_viewed_at: 500, roles: ''},
                        },
                        channels: {
                            [channelId]: {id: channelId},
                            [otherChannelId]: {id: otherChannelId},
                        },
                    },
                    posts: {
                        posts: {
                            [post1.id]: post1,
                        },
                    },
                    users: {
                        currentUserId,
                    },
                    general: {
                        config: {
                            test: true,
                        },
                    },
                    preferences: {
                        myPreferences: {},
                    },
                },
            });

            window.isActive = true;

            await testStore.dispatch(NewPostActions.setChannelReadAndViewed(post2, {}, false));

            expect(testStore.getActions()).toEqual([{
                type: 'MOCK_MARK_CHANNEL_AS_UNREAD',
                args: [undefined, channelId, undefined, false],
            }]);
        });

        test('should mark channel as read when not viewing channel and post is from current user', async () => {
            const channelId = 'channel1';
            const otherChannelId = 'channel2';
            const currentUserId = 'user';

            const post1 = {id: 'post1', channel_id: channelId, create_at: 1000};
            const post2 = {id: 'post2', channel_id: channelId, create_at: 2000, user_id: currentUserId};

            const testStore = await mockStore({
                entities: {
                    channels: {
                        currentChannelId: otherChannelId,
                        manuallyUnread: {},
                        myMembers: {
                            [channelId]: {channel_id: channelId, last_viewed_at: 500, roles: ''},
                            [otherChannelId]: {channel_id: otherChannelId, last_viewed_at: 500, roles: ''},
                        },
                        channels: {
                            [channelId]: {id: channelId},
                            [otherChannelId]: {id: otherChannelId},
                        },
                    },
                    posts: {
                        posts: {
                            [post1.id]: post1,
                        },
                    },
                    users: {
                        currentUserId,
                    },
                    general: {
                        config: {
                            test: true,
                        },
                    },
                    preferences: {
                        myPreferences: {},
                    },
                },
            });

            await testStore.dispatch(NewPostActions.setChannelReadAndViewed(post2, {}, false));

            expect(testStore.getActions()).toEqual([{
                type: 'MOCK_MARK_CHANNEL_AS_READ',
                args: [channelId, undefined, false],
            }, {
                type: 'MOCK_MARK_CHANNEL_AS_VIEWED',
                args: [channelId],
            }]);
        });

        test('should mark channel as unread when not viewing channel and post is from webhook owned by current user', async () => {
            const channelId = 'channel1';
            const otherChannelId = 'channel2';
            const currentUserId = 'user';

            const post1 = {id: 'post1', channel_id: channelId, create_at: 1000};
            const post2 = {id: 'post2', channel_id: channelId, create_at: 2000, props: {from_webhook: 'true'}, user_id: currentUserId};

            const testStore = await mockStore({
                entities: {
                    channels: {
                        currentChannelId: otherChannelId,
                        manuallyUnread: {},
                        myMembers: {
                            [channelId]: {channel_id: channelId, last_viewed_at: 500, roles: ''},
                            [otherChannelId]: {channel_id: otherChannelId, last_viewed_at: 500, roles: ''},
                        },
                        channels: {
                            [channelId]: {id: channelId},
                            [otherChannelId]: {id: otherChannelId},
                        },
                    },
                    posts: {
                        posts: {
                            [post1.id]: post1,
                        },
                    },
                    users: {
                        currentUserId,
                    },
                    general: {
                        config: {
                            test: true,
                        },
                    },
                    preferences: {
                        myPreferences: {},
                    },
                },
            });

            await testStore.dispatch(NewPostActions.setChannelReadAndViewed(post2, {}, false));

            expect(testStore.getActions()).toEqual([{
                type: 'MOCK_MARK_CHANNEL_AS_UNREAD',
                args: [undefined, channelId, undefined, false],
            }]);
        });

        test('should not mark channel as read when viewing channel that was marked as unread', async () => {
            const channelId = 'channel1';
            const currentUserId = 'user';

            const post1 = {id: 'post1', channel_id: channelId, create_at: 1000};
            const post2 = {id: 'post2', channel_id: channelId, create_at: 2000};

            const testStore = await mockStore({
                entities: {
                    channels: {
                        currentChannelId: channelId,
                        manuallyUnread: {
                            [channelId]: true,
                        },
                        myMembers: {
                            [channelId]: {channel_id: channelId, last_viewed_at: post1.create_at - 1, roles: ''},
                        },
                        channels: {
                            [channelId]: {id: channelId},
                        },
                    },
                    posts: {
                        posts: {
                            [post1.id]: post1,
                        },
                    },
                    users: {
                        currentUserId,
                    },
                },
            });

            await testStore.dispatch(NewPostActions.setChannelReadAndViewed(post2, {}, false));

            expect(testStore.getActions()).toEqual([{
                type: 'MOCK_MARK_CHANNEL_AS_UNREAD',
                args: [undefined, channelId, undefined, false],
            }]);
        });
    });
});
