// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {General, Posts} from 'mattermost-redux/constants';
import {leaveChannel, markChannelAsRead} from 'mattermost-redux/actions/channels';
import * as PostActions from 'mattermost-redux/actions/posts';

import {browserHistory} from 'utils/browser_history';
import * as Actions from 'actions/views/channel';
import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {ActionTypes, PostRequestTypes} from 'utils/constants';

const mockStore = configureStore([thunk]);

jest.mock('utils/browser_history', () => ({
    browserHistory: {
        push: jest.fn(),
    },
}));

jest.mock('utils/channel_utils.jsx', () => ({
    getRedirectChannelNameForTeam: () => 'town-square',
}));

jest.mock('actions/channel_actions.jsx', () => ({
    openDirectChannelToUserId: jest.fn(() => ({type: ''})),
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    ...jest.requireActual('mattermost-redux/actions/channels'),
    markChannelAsRead: jest.fn(() => ({type: ''})),
    leaveChannel: jest.fn(() => ({type: ''})),
}));

jest.mock('mattermost-redux/actions/posts');

jest.mock('selectors/local_storage', () => ({
    getLastViewedChannelName: () => 'channel1',
}));

describe('channel view actions', () => {
    const channel1 = {id: 'channelid1', name: 'channel1', display_name: 'Channel 1', type: 'O', team_id: 'teamid1'};
    const townsquare = {id: 'channelid2', name: General.DEFAULT_CHANNEL, display_name: 'Town Square', type: 'O', team_id: 'teamid1'};
    const gmChannel = {id: 'gmchannelid', name: 'gmchannel', display_name: 'GM Channel 1', type: 'G'};
    const team1 = {id: 'teamid1', name: 'team1'};

    const initialState = {
        entities: {
            users: {
                currentUserId: 'userid1',
                profiles: {userid1: {id: 'userid1', username: 'username1', roles: 'system_user'}, userid2: {id: 'userid2', username: 'username2', roles: 'system_user'}},
                profilesInChannel: {},
            },
            teams: {
                currentTeamId: 'teamid1',
                myMembers: {teamId1: {}},
                teams: {teamid1: team1},
            },
            channels: {
                currentChannelId: 'channelid1',
                channels: {channelid1: channel1, channelid2: townsquare, gmchannelid: gmChannel},
                manuallyUnread: {},
                myMembers: {
                    gmchannelid: {channel_id: 'gmchannelid', user_id: 'userid1'},
                    channelid1: {channel_id: 'channelid1', user_id: 'userid1'},
                    townsquare: {channel_id: 'townsquare', user_id: 'userid1'},
                },
                channelsInTeam: {
                    [team1.id]: [channel1.id, townsquare.id],
                },
            },
            general: {
                config: {},
                serverVersion: '5.12.0',
            },
            roles: {
                roles: {
                    system_user: {permissions: ['join_public_channels']},
                },
            },
            preferences: {
                myPreferences: {},
            },
        },
        views: {
            channel: {
                loadingPosts: {},
                postVisibility: {current_channel_id: 60},
            },
        },
    };

    let store;

    beforeEach(() => {
        store = mockStore(initialState);
    });

    describe('switchToChannel', () => {
        test('switch to public channel', () => {
            store.dispatch(Actions.switchToChannel(channel1));
            expect(browserHistory.push).toHaveBeenCalledWith(`/${team1.name}/channels/${channel1.name}`);
        });

        test('switch to fake direct channel', async () => {
            await store.dispatch(Actions.switchToChannel({fake: true, userId: 'userid2', name: 'username2'}));
            expect(openDirectChannelToUserId).toHaveBeenCalledWith('userid2');
            expect(browserHistory.push).toHaveBeenCalledWith(`/${team1.name}/messages/@username2`);
        });

        test('switch to gm channel', async () => {
            await store.dispatch(Actions.switchToChannel(gmChannel));
            expect(browserHistory.push).toHaveBeenCalledWith(`/${team1.name}/channels/${gmChannel.name}`);
        });
    });

    describe('leaveChannel', () => {
        test('leave a channel successfully', async () => {
            await store.dispatch(Actions.leaveChannel('channelid1'));
            expect(browserHistory.push).toHaveBeenCalledWith(`/${team1.name}`);
            expect(leaveChannel).toHaveBeenCalledWith('channelid1');
        });
        test('leave the last channel successfully', async () => {
            store = mockStore({
                ...initialState,
                entities: {
                    ...initialState.entities,
                    channels: {
                        ...initialState.entities,
                        myMembers: {
                            channelid1: {channel_id: 'channelid1', user_id: 'userid1'},
                        },
                    },
                },
            });

            await store.dispatch(Actions.leaveChannel('channelid1'));
            expect(browserHistory.push).toHaveBeenCalledWith('/');
            expect(leaveChannel).toHaveBeenCalledWith('channelid1');
        });
    });

    describe('goToLastViewedChannel', () => {
        test('should switch to town square if last viewed channel is current channel', async () => {
            await store.dispatch(Actions.goToLastViewedChannel());
            expect(browserHistory.push).toHaveBeenCalledWith(`/${team1.name}/channels/${General.DEFAULT_CHANNEL}`);
        });
    });

    describe('loadLatestPosts', () => {
        test('should call getPosts and return the results', async () => {
            const posts = {posts: {}, order: []};

            PostActions.getPosts.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.loadLatestPosts('channel'));

            expect(result.data).toBe(posts);

            expect(PostActions.getPosts).toHaveBeenCalledWith('channel', 0, Posts.POST_CHUNK_SIZE / 2);
        });

        test('when oldest posts are recived', async () => {
            const posts = {posts: {}, order: new Array(Posts.POST_CHUNK_SIZE), next_post_id: 'test', prev_post_id: ''};

            PostActions.getPosts.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.loadLatestPosts('channel'));

            expect(result.atLatestMessage).toBe(false);
            expect(result.atOldestmessage).toBe(true);
        });

        test('when latest posts are received', async () => {
            Date.now = jest.fn().mockReturnValue(12344);

            const posts = {posts: {}, order: new Array((Posts.POST_CHUNK_SIZE / 2) - 1), next_post_id: '', prev_post_id: 'test'};

            PostActions.getPosts.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.loadLatestPosts('channel'));

            expect(result.atLatestMessage).toBe(true);
            expect(result.atOldestmessage).toBe(false);

            expect(store.getActions()).toEqual([
                {
                    channelId: 'channel',
                    time: 12344,
                    type: ActionTypes.RECEIVED_POSTS_FOR_CHANNEL_AT_TIME,
                },
            ]);
        });
    });

    describe('loadUnreads', () => {
        test('when there are no posts after and before the response', async () => {
            const posts = {posts: {}, order: [], next_post_id: '', prev_post_id: ''};

            PostActions.getPostsUnread.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.loadUnreads('channel', 'post'));

            expect(result).toEqual({atLatestMessage: true, atOldestmessage: true});
            expect(PostActions.getPostsUnread).toHaveBeenCalledWith('channel');
        });

        test('when there are posts before and after the response', async () => {
            const posts = {
                posts: {},
                order: [
                    ...new Array(Posts.POST_CHUNK_SIZE / 2), // after
                    'post',
                    ...new Array(Posts.POST_CHUNK_SIZE / 2), // before
                ],
                next_post_id: 'test',
                prev_post_id: 'test',
            };

            PostActions.getPostsUnread.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.loadUnreads('channel', 'post'));
            expect(result).toEqual({atLatestMessage: false, atOldestmessage: false});
            expect(PostActions.getPostsUnread).toHaveBeenCalledWith('channel');
        });

        test('when there are no posts after RECEIVED_POSTS_FOR_CHANNEL_AT_TIME should be dispatched', async () => {
            const posts = {posts: {}, order: [], next_post_id: '', prev_post_id: ''};
            Date.now = jest.fn().mockReturnValue(12344);

            PostActions.getPostsUnread.mockReturnValue(() => ({data: posts}));

            await store.dispatch(Actions.loadUnreads('channel', 'post'));

            expect(store.getActions()).toEqual([
                {amount: 0, data: 'channel', type: 'INCREASE_POST_VISIBILITY'},
                {
                    channelId: 'channel',
                    time: 12344,
                    type: 'RECEIVED_POSTS_FOR_CHANNEL_AT_TIME'},
            ]);
        });
    });

    describe('loadPostsAround', () => {
        test('should call getPostsAround and return the results', async () => {
            const posts = {posts: {}, order: [], next_post_id: '', prev_post_id: ''};

            PostActions.getPostsAround.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.loadPostsAround('channel', 'post'));

            expect(result).toEqual({atLatestMessage: true, atOldestmessage: true});

            expect(PostActions.getPostsAround).toHaveBeenCalledWith('channel', 'post', Posts.POST_CHUNK_SIZE / 2);
        });

        test('when there are posts before and after reponse posts chunk', async () => {
            const posts = {
                posts: {},
                order: [
                    ...new Array(Posts.POST_CHUNK_SIZE / 2), // after
                    'post',
                    ...new Array(Posts.POST_CHUNK_SIZE / 2), // before
                ],
                next_post_id: 'test',
                prev_post_id: 'test',
            };

            PostActions.getPostsAround.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.loadPostsAround('channel', 'post'));

            expect(result).toEqual({atLatestMessage: false, atOldestmessage: false});
        });

        test('when there are posts before the reponse posts chunk', async () => {
            const posts = {
                posts: {},
                order: [
                    ...new Array(Posts.POST_CHUNK_SIZE / 2), // after
                    'post',
                    ...new Array((Posts.POST_CHUNK_SIZE / 2) - 1), // before
                ],
                next_post_id: '',
                prev_post_id: 'test',
            };

            PostActions.getPostsAround.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.loadPostsAround('channel', 'post'));

            expect(result).toEqual({atLatestMessage: true, atOldestmessage: false});
        });

        test('when there are posts before the reponse posts chunk', async () => {
            const posts = {
                posts: {},
                order: [
                    ...new Array((Posts.POST_CHUNK_SIZE / 2) - 1), // after
                    'post',
                    ...new Array(Posts.POST_CHUNK_SIZE / 2), // before
                ],
                next_post_id: 'test',
                prev_post_id: '',
            };

            PostActions.getPostsAround.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.loadPostsAround('channel', 'post'));

            expect(result).toEqual({atLatestMessage: false, atOldestmessage: true});
        });

        test('when there are no posts before and after the posts chunk', async () => {
            const posts = {
                posts: {},
                order: [
                    ...new Array((Posts.POST_CHUNK_SIZE / 2) - 1), // after
                    'post',
                    ...new Array((Posts.POST_CHUNK_SIZE / 2) - 1), // before
                ],
                next_post_id: '',
                prev_post_id: '',
            };

            PostActions.getPostsAround.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.loadPostsAround('channel', 'post'));

            expect(result).toEqual({atLatestMessage: true, atOldestmessage: true});
        });
    });

    describe('increasePostVisibility', () => {
        test('should dispatch the correct actions', async () => {
            const posts = {
                posts: {},
                order: new Array(7),
                prev_post_id: '',
                next_post_id: '',
            };

            PostActions.getPostsBefore.mockReturnValue(() => ({data: posts}));

            await store.dispatch(Actions.loadPosts({channelId: 'current_channel_id', postId: 'oldest_post_id', type: PostRequestTypes.BEFORE_ID}));

            expect(store.getActions()).toEqual([
                {channelId: 'current_channel_id', data: true, type: 'LOADING_POSTS'},
                {
                    meta: {batch: true},
                    payload: [
                        {channelId: 'current_channel_id', data: false, type: 'LOADING_POSTS'},
                        {amount: 7, data: 'current_channel_id', type: 'INCREASE_POST_VISIBILITY'},
                    ],
                    type: 'BATCHING_REDUCER.BATCH',
                },
            ]);
        });

        test('should increase post visibility when receiving posts', async () => {
            Date.now = jest.fn().mockReturnValue(12344);

            const channelId = 'channel1';
            const posts = {
                posts: {},
                order: new Array(7),
            };

            PostActions.getPostsBefore.mockReturnValue(() => ({data: posts}));

            await store.dispatch(Actions.loadPosts({channelId, postId: 'oldest_post_id', type: PostRequestTypes.BEFORE_ID}));

            expect(store.getActions()).toContainEqual({
                meta: {batch: true},
                payload: [
                    {
                        type: ActionTypes.LOADING_POSTS,
                        channelId,
                        data: false,
                    },
                    {
                        type: ActionTypes.INCREASE_POST_VISIBILITY,
                        amount: posts.order.length,
                        data: channelId,
                    },
                ],
                type: 'BATCHING_REDUCER.BATCH',
            });
        });

        test('should return more to load when enough posts are received', async () => {
            const channelId = 'channel1';
            const posts = {
                posts: {},
                order: new Array(Posts.POST_CHUNK_SIZE / 2),
                prev_post_id: 'saasdsd',
            };

            PostActions.getPostsBefore.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.loadPosts({channelId, postId: 'oldest_post_id', type: PostRequestTypes.BEFORE_ID}));

            expect(result).toEqual({
                moreToLoad: true,
            });
        });

        test('should not return more to load when not enough posts are received', async () => {
            const channelId = 'channel1';
            const posts = {
                posts: {},
                order: new Array((Posts.POST_CHUNK_SIZE / 2) - 1),
                prev_post_id: '',
            };

            PostActions.getPostsBefore.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.loadPosts({channelId, postId: 'oldest_post_id', type: PostRequestTypes.BEFORE_ID}));

            expect(result).toEqual({
                moreToLoad: false,
            });
        });

        test('should return error from getPostsBefore', async () => {
            const channelId = 'channel1';
            const error = {message: 'something went wrong'};

            PostActions.getPostsBefore.mockReturnValue(() => ({error}));

            const result = await store.dispatch(Actions.loadPosts({channelId, postId: 'oldest_post_id', type: PostRequestTypes.BEFORE_ID}));

            expect(result).toEqual({
                error,
                moreToLoad: true,
            });
        });
    });

    describe('syncPostsInChannel', () => {
        test('should call getPostsSince with since argument time as last discconet was earlier than lastGetPosts', async () => {
            const channelId = 'channel1';
            PostActions.getPostsSince.mockReturnValue(() => ({data: []}));

            store = mockStore({
                ...initialState,
                views: {
                    ...initialState.views,
                    channel: {
                        ...initialState.views.channel,
                        lastGetPosts: {
                            [channelId]: 12345,
                        },
                    },
                },
                websocket: {
                    lastDisconnectAt: 12344,
                },
            });

            await store.dispatch(Actions.syncPostsInChannel(channelId, 12350));
            expect(PostActions.getPostsSince).toHaveBeenCalledWith(channelId, 12350);
        });

        test('should call getPostsSince with lastDisconnect time as last discconet was later than lastGetPosts', async () => {
            const channelId = 'channel1';
            PostActions.getPostsSince.mockReturnValue(() => ({data: []}));

            store = mockStore({
                ...initialState,
                views: {
                    ...initialState.views,
                    channel: {
                        ...initialState.views.channel,
                        lastGetPosts: {
                            [channelId]: 12343,
                        },
                    },
                },
                websocket: {
                    lastDisconnectAt: 12344,
                },
            });

            await store.dispatch(Actions.syncPostsInChannel(channelId, 12355));
            expect(PostActions.getPostsSince).toHaveBeenCalledWith(channelId, 12343);
        });
    });

    describe('markChannelAsReadOnFocus', () => {
        test('should mark channel as read when channel is not manually unread', async () => {
            test = mockStore(initialState);

            await store.dispatch(Actions.markChannelAsReadOnFocus(channel1.id));

            expect(markChannelAsRead).toHaveBeenCalledWith(channel1.id);
        });

        test('should not mark channel as read when channel is manually unread', async () => {
            store = mockStore({
                ...initialState,
                entities: {
                    ...initialState.entities,
                    channels: {
                        ...initialState.entities.channels,
                        manuallyUnread: {
                            [channel1.id]: true,
                        },
                    },
                },
            });

            await store.dispatch(Actions.markChannelAsReadOnFocus(channel1.id));

            expect(markChannelAsRead).not.toHaveBeenCalled();
        });
    });
});
