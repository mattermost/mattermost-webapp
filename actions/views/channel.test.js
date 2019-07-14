// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {General, Posts} from 'mattermost-redux/constants';
import {leaveChannel} from 'mattermost-redux/actions/channels';
import * as PostActions from 'mattermost-redux/actions/posts';

import {browserHistory} from 'utils/browser_history';
import * as Actions from 'actions/views/channel';
import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {ActionTypes} from 'utils/constants.jsx';

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
    openDirectChannelToUserId: jest.fn(() => {
        return {type: ''};
    }),
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    leaveChannel: jest.fn(() => {
        return {type: ''};
    }),
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
                myMembers: {gmchannelid: {channel_id: 'gmchannelid', user_id: 'userid1'}},
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
    });

    describe('goToLastViewedChannel', () => {
        test('should switch to town square if last viewed channel is current channel', async () => {
            await store.dispatch(Actions.goToLastViewedChannel());
            expect(browserHistory.push).toHaveBeenCalledWith(`/${team1.name}/channels/${General.DEFAULT_CHANNEL}`);
        });
    });

    describe('loadInitialPosts', () => {
        describe('without a focused post', () => {
            test('should call getPosts and return the results', async () => {
                const posts = {posts: {}, order: []};

                PostActions.getPosts.mockReturnValue(() => ({data: posts}));

                const result = await store.dispatch(Actions.loadInitialPosts('channel'));

                expect(result.posts).toBe(posts);

                expect(PostActions.getPosts).toHaveBeenCalledWith('channel', 0, Posts.POST_CHUNK_SIZE / 2);
            });

            test('when enough posts are received', async () => {
                const posts = {posts: {}, order: new Array(Posts.POST_CHUNK_SIZE)};

                PostActions.getPosts.mockReturnValue(() => ({data: posts}));

                const result = await store.dispatch(Actions.loadInitialPosts('channel'));

                expect(result.hasMoreBefore).toBe(true);
                expect(result.hasMoreAfter).toBe(false);
            });

            test('when not enough posts are received', async () => {
                const posts = {posts: {}, order: new Array((Posts.POST_CHUNK_SIZE / 2) - 1)};

                PostActions.getPosts.mockReturnValue(() => ({data: posts}));

                const result = await store.dispatch(Actions.loadInitialPosts('channel'));

                expect(result.hasMoreBefore).toBe(false);
                expect(result.hasMoreAfter).toBe(false);
            });
        });

        describe('with a focused post', () => {
            test('should call getPostsAround and return the results', async () => {
                Date.now = jest.fn().mockReturnValue(12344);

                const posts = {posts: {}, order: []};

                PostActions.getPostsAround.mockReturnValue(() => ({data: posts}));

                const result = await store.dispatch(Actions.loadInitialPosts('channel', 'post'));

                expect(result.posts).toBe(posts);

                expect(PostActions.getPostsAround).toHaveBeenCalledWith('channel', 'post', Posts.POST_CHUNK_SIZE / 2);

                expect(store.getActions()).toEqual([
                    {
                        channelId: 'channel',
                        time: 12344,
                        type: ActionTypes.RECEIVED_POSTS_FOR_CHANNEL_AT_TIME,
                    },
                ]);
            });

            test('when enough posts are received before and after the focused post', async () => {
                const posts = {
                    posts: {},
                    order: [
                        ...new Array(Posts.POST_CHUNK_SIZE / 2), // after
                        'post',
                        ...new Array(Posts.POST_CHUNK_SIZE / 2), // before
                    ],
                };

                PostActions.getPostsAround.mockReturnValue(() => ({data: posts}));

                const result = await store.dispatch(Actions.loadInitialPosts('channel', 'post'));

                expect(result.hasMoreAfter).toBe(true);
                expect(result.hasMoreBefore).toBe(true);
            });

            test('when not enough posts are received before the focused post', async () => {
                const posts = {
                    posts: {},
                    order: [
                        ...new Array(Posts.POST_CHUNK_SIZE / 2), // after
                        'post',
                        ...new Array((Posts.POST_CHUNK_SIZE / 2) - 1), // before
                    ],
                };

                PostActions.getPostsAround.mockReturnValue(() => ({data: posts}));

                const result = await store.dispatch(Actions.loadInitialPosts('channel', 'post'));

                expect(result.hasMoreAfter).toBe(true);
                expect(result.hasMoreBefore).toBe(false);
            });

            test('when not enough posts are received after the focused post', async () => {
                const posts = {
                    posts: {},
                    order: [
                        ...new Array((Posts.POST_CHUNK_SIZE / 2) - 1), // after
                        'post',
                        ...new Array(Posts.POST_CHUNK_SIZE / 2), // before
                    ],
                };

                PostActions.getPostsAround.mockReturnValue(() => ({data: posts}));

                const result = await store.dispatch(Actions.loadInitialPosts('channel', 'post'));

                expect(result.hasMoreAfter).toBe(false);
                expect(result.hasMoreBefore).toBe(true);
            });

            test('when not enough posts are received before and after the focused post', async () => {
                const posts = {
                    posts: {},
                    order: [
                        ...new Array((Posts.POST_CHUNK_SIZE / 2) - 1), // after
                        'post',
                        ...new Array((Posts.POST_CHUNK_SIZE / 2) - 1), // before
                    ],
                };

                PostActions.getPostsAround.mockReturnValue(() => ({data: posts}));

                const result = await store.dispatch(Actions.loadInitialPosts('channel', 'post'));

                expect(result.hasMoreAfter).toBe(false);
                expect(result.hasMoreBefore).toBe(false);
            });
        });
    });

    describe('increasePostVisibility', () => {
        test('should dispatch the correct actions', async () => {
            PostActions.getPostsBefore.mockImplementation((...args) => ({type: 'MOCK_GET_POSTS_BEFORE', args}));

            await store.dispatch(Actions.increasePostVisibility('current_channel_id', 'oldest_post_id'));

            expect(store.getActions()).toEqual([
                {channelId: 'current_channel_id', data: true, type: 'LOADING_POSTS'},
                {
                    args: ['current_channel_id', 'oldest_post_id', 0, 30],
                    type: 'MOCK_GET_POSTS_BEFORE',
                },
                {
                    meta: {batch: true},
                    payload: [
                        {channelId: 'current_channel_id', data: false, type: 'LOADING_POSTS'},
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

            await store.dispatch(Actions.increasePostVisibility(channelId, 'oldest_post_id'));

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
            };

            PostActions.getPostsBefore.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.increasePostVisibility(channelId, 'oldest_post_id'));

            expect(result).toEqual({
                moreToLoad: true,
            });
        });

        test('should not return more to load when not enough posts are received', async () => {
            const channelId = 'channel1';
            const posts = {
                posts: {},
                order: new Array((Posts.POST_CHUNK_SIZE / 2) - 1),
            };

            PostActions.getPostsBefore.mockReturnValue(() => ({data: posts}));

            const result = await store.dispatch(Actions.increasePostVisibility(channelId, 'oldest_post_id'));

            expect(result).toEqual({
                moreToLoad: false,
            });
        });

        test('should return error from getPostsBefore', async () => {
            const channelId = 'channel1';
            const error = {message: 'something went wrong'};

            PostActions.getPostsBefore.mockReturnValue(() => ({error}));

            const result = await store.dispatch(Actions.increasePostVisibility(channelId, 'oldest_post_id'));

            expect(result).toEqual({
                error,
                moreToLoad: false,
            });
        });

        test('should do nothing when already loading posts', async () => {
            const channelId = 'channel1';

            store = mockStore({
                ...initialState,
                views: {
                    ...initialState.views,
                    channel: {
                        ...initialState.views.channel,
                        loadingPosts: {
                            [channelId]: true,
                        },
                    },
                },
            });

            const result = await store.dispatch(Actions.increasePostVisibility(channelId, 'oldest_post_id'));

            expect(result).toBe(true);

            expect(PostActions.getPostsBefore).not.toHaveBeenCalled();
        });

        test('should do nothing with too many posts loaded', async () => {
            const channelId = 'channel1';

            store = mockStore({
                ...initialState,
                views: {
                    ...initialState.views,
                    channel: {
                        ...initialState.views.channel,
                        postVisibility: {
                            [channelId]: 100000000,
                        },
                    },
                },
            });

            const result = await store.dispatch(Actions.increasePostVisibility(channelId, 'oldest_post_id'));

            expect(result).toBe(true);

            expect(PostActions.getPostsBefore).not.toHaveBeenCalled();
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
                    websocket: {
                        lastDisconnectAt: 12344,
                    },
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
                    websocket: {
                        lastDisconnectAt: 12344,
                    },
                },
            });

            await store.dispatch(Actions.syncPostsInChannel(channelId, 12355));
            expect(PostActions.getPostsSince).toHaveBeenCalledWith(channelId, 12343);
        });
    });
});
