// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {SearchTypes} from 'mattermost-redux/action_types';
import * as PostActions from 'mattermost-redux/actions/posts';
import {Posts} from 'mattermost-redux/constants';

import * as Actions from 'actions/post_actions';
import {Constants, ActionTypes, RHSStates} from 'utils/constants';

const mockStore = configureStore([thunk]);

jest.mock('mattermost-redux/actions/posts', () => ({
    addReaction: (...args) => ({type: 'MOCK_ADD_REACTION', args}),
    createPost: (...args) => ({type: 'MOCK_CREATE_POST', args}),
    createPostImmediately: (...args) => ({type: 'MOCK_CREATE_POST_IMMEDIATELY', args}),
    flagPost: (...args) => ({type: 'MOCK_FLAG_POST', args}),
    unflagPost: (...args) => ({type: 'MOCK_UNFLAG_POST', args}),
    pinPost: (...args) => ({type: 'MOCK_PIN_POST', args}),
    unpinPost: (...args) => ({type: 'MOCK_UNPIN_POST', args}),
    receivedNewPost: (...args) => ({type: 'MOCK_RECEIVED_NEW_POST', args}),
}));

jest.mock('actions/emoji_actions', () => ({
    addRecentEmoji: (...args) => ({type: 'MOCK_ADD_RECENT_EMOJI', args}),
}));

jest.mock('actions/storage', () => {
    const original = jest.requireActual('actions/storage');
    return {
        ...original,
        setGlobalItem: (...args) => ({type: 'MOCK_SET_GLOBAL_ITEM', args}),
    };
});

jest.mock('utils/user_agent', () => ({
    isIosClassic: jest.fn().mockReturnValueOnce(true).mockReturnValue(false),
}));

const POST_CREATED_TIME = Date.now();

// This mocks the Date.now() function so it returns a constant value
global.Date.now = jest.fn(() => POST_CREATED_TIME);

const INCREASED_POST_VISIBILITY = {amount: 1, data: 'current_channel_id', type: 'INCREASE_POST_VISIBILITY'};
const STOP_TYPING = {type: 'stop_typing', data: {id: 'current_channel_idundefined', now: POST_CREATED_TIME, userId: 'some_user_id'}};

describe('Actions.Posts', () => {
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
                myMembers: {
                    [latestPost.channel_id]: {
                        channel_id: 'current_channel_id',
                        user_id: 'current_user_id',
                        roles: 'channel_role',
                    },
                    other_channel_id: {
                        channel_id: 'other_channel_id',
                        user_id: 'current_user_id',
                        roles: 'channel_role',
                    },
                },
                channels: {
                    current_channel_id: {team_a: 'team_a', id: 'current_channel_id'},
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
                currentTeamId: 'team-a',
                teams: {
                    team_a: {
                        id: 'team_a',
                        name: 'team-a',
                        displayName: 'Team A',
                    },
                    team_b: {
                        id: 'team_b',
                        name: 'team-a',
                        displayName: 'Team B',
                    },
                },
                myMembers: {
                    'team-a': {roles: 'team_role'},
                    'team-b': {roles: 'team_role'},
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {
                        id: 'current_user_id',
                        username: 'current_username',
                        roles: 'system_role',
                        useAutomaticTimezone: true,
                        automaticTimezone: '',
                        manualTimezone: '',
                    },
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
            emojis: {customEmoji: {}},
            search: {results: []},
        },
        views: {
            posts: {
                editingPost: {},
            },
            rhs: {searchTerms: ''},
        },
    };

    test('handleNewPost', async () => {
        const testStore = await mockStore(initialState);
        const newPost = {id: 'new_post_id', channel_id: 'current_channel_id', message: 'new message', type: Constants.PostTypes.ADD_TO_CHANNEL, user_id: 'some_user_id', create_at: POST_CREATED_TIME};
        const msg = {data: {team_a: 'team_a', mentions: ['current_user_id']}};

        await testStore.dispatch(Actions.handleNewPost(newPost, msg));
        expect(testStore.getActions()).toEqual([
            INCREASED_POST_VISIBILITY,
            {
                meta: {batch: true},
                payload: [PostActions.receivedNewPost(newPost), STOP_TYPING],
                type: 'BATCHING_REDUCER.BATCH',
            },
        ]);
    });

    test('handleNewPostOtherChannel', async () => {
        const testStore = await mockStore(initialState);
        const newPost = {id: 'other_channel_post_id', channel_id: 'other_channel_id', message: 'new message in other channel', type: '', user_id: 'other_user_id', create_at: POST_CREATED_TIME};
        const msg = {data: {team_b: 'team_b', mentions: ['current_user_id']}};

        await testStore.dispatch(Actions.handleNewPost(newPost, msg));
        expect(testStore.getActions()).toEqual([
            {
                meta: {batch: true},
                payload: [
                    PostActions.receivedNewPost(newPost),
                    {
                        type: 'stop_typing',
                        data: {
                            id: 'other_channel_idundefined',
                            now: POST_CREATED_TIME,
                            userId: newPost.user_id},
                    },
                ],
                type: 'BATCHING_REDUCER.BATCH',
            },
        ]);
    });

    test('setEditingPost', async () => {
        // should allow to edit and should fire an action
        let testStore = mockStore({...initialState});
        const {data} = await testStore.dispatch(Actions.setEditingPost('latest_post_id', 0, 'test', 'title'));
        expect(data).toEqual(true);

        expect(testStore.getActions()).toEqual(
            [{data: {commentCount: 0, isRHS: false, postId: 'latest_post_id', refocusId: 'test', title: 'title'}, type: ActionTypes.SHOW_EDIT_POST_MODAL}],
        );

        const general = {
            license: {IsLicensed: 'true'},
            serverVersion: '5.4.0',
            config: {PostEditTimeLimit: -1},
        };
        const withLicenseState = {...initialState};
        withLicenseState.entities.general = general;

        testStore = mockStore(withLicenseState);

        const {data: withLicenseData} = await testStore.dispatch(Actions.setEditingPost('latest_post_id', 0, 'test', 'title'));
        expect(withLicenseData).toEqual(true);
        expect(testStore.getActions()).toEqual(
            [{data: {commentCount: 0, isRHS: false, postId: 'latest_post_id', refocusId: 'test', title: 'title'}, type: ActionTypes.SHOW_EDIT_POST_MODAL}],
        );

        // should not allow edit for pending post
        const newLatestPost = {...latestPost, pending_post_id: latestPost.id};
        const withPendingPostState = {...initialState};
        withPendingPostState.entities.posts.posts[latestPost.id] = newLatestPost;

        testStore = mockStore(withPendingPostState);

        const {data: withPendingPostData} = await testStore.dispatch(Actions.setEditingPost('latest_post_id', 0, 'test', 'title'));
        expect(withPendingPostData).toEqual(false);
        expect(testStore.getActions()).toEqual([]);
    });

    test('hideEditPostModal', async () => {
        const testStore = await mockStore(initialState);

        await testStore.dispatch(Actions.hideEditPostModal());
        expect(testStore.getActions()).toEqual([{type: ActionTypes.HIDE_EDIT_POST_MODAL}]);
    });

    test('searchForTerm', async () => {
        const testStore = await mockStore(initialState);

        await testStore.dispatch(Actions.searchForTerm('hello'));
        expect(testStore.getActions()).toEqual([
            {terms: 'hello', type: 'UPDATE_RHS_SEARCH_TERMS'},
            {state: 'search', type: 'UPDATE_RHS_STATE'},
            {terms: '', type: 'UPDATE_RHS_SEARCH_RESULTS_TERMS'},
            {isGettingMore: false, type: 'SEARCH_POSTS_REQUEST'},
        ]);
    });

    describe('createPost', () => {
        test('no emojis', async () => {
            const testStore = await mockStore(initialState);
            const newPost = {id: 'new_post_id', channel_id: 'current_channel_id', message: 'new message'};
            const newReply = {id: 'reply_post_id', channel_id: 'current_channel_id', message: 'new message', root_id: 'new_post_id'};
            const files = [];

            const immediateExpectedState = [{
                args: [newPost, files],
                type: 'MOCK_CREATE_POST_IMMEDIATELY',
            }, {
                args: ['draft_current_channel_id', null],
                type: 'MOCK_SET_GLOBAL_ITEM',
            }];

            await testStore.dispatch(Actions.createPost(newPost, files));
            expect(testStore.getActions()).toEqual(immediateExpectedState);

            const finalExpectedState = [
                ...immediateExpectedState,
                {
                    args: [newReply, files],
                    type: 'MOCK_CREATE_POST',
                }, {
                    args: ['comment_draft_new_post_id', null],
                    type: 'MOCK_SET_GLOBAL_ITEM',
                },
            ];

            await testStore.dispatch(Actions.createPost(newReply, files));
            expect(testStore.getActions()).toEqual(finalExpectedState);
        });

        test('with single shorthand emoji', async () => {
            const testStore = await mockStore(initialState);
            const newPost = {id: 'new_post_id', channel_id: 'current_channel_id', message: 'new message :+1:'};
            const files = [];

            const immediateExpectedState = [{
                args: ['+1'],
                type: 'MOCK_ADD_RECENT_EMOJI',
            }, {
                args: [newPost, files],
                type: 'MOCK_CREATE_POST',
            }, {
                args: ['draft_current_channel_id', null],
                type: 'MOCK_SET_GLOBAL_ITEM',
            }];

            await testStore.dispatch(Actions.createPost(newPost, files));
            expect(testStore.getActions()).toEqual(immediateExpectedState);
        });

        test('with single named emoji', async () => {
            const testStore = await mockStore(initialState);
            const newPost = {id: 'new_post_id', channel_id: 'current_channel_id', message: 'new message :cake:'};
            const files = [];

            const immediateExpectedState = [{
                args: ['cake'],
                type: 'MOCK_ADD_RECENT_EMOJI',
            }, {
                args: [newPost, files],
                type: 'MOCK_CREATE_POST',
            }, {
                args: ['draft_current_channel_id', null],
                type: 'MOCK_SET_GLOBAL_ITEM',
            }];

            await testStore.dispatch(Actions.createPost(newPost, files));
            expect(testStore.getActions()).toEqual(immediateExpectedState);
        });

        test('with multiple emoji', async () => {
            const testStore = await mockStore(initialState);
            const newPost = {id: 'new_post_id', channel_id: 'current_channel_id', message: 'new message :cake: :+1:'};
            const files = [];

            const immediateExpectedState = [{
                args: ['cake'],
                type: 'MOCK_ADD_RECENT_EMOJI',
            }, {
                args: ['+1'],
                type: 'MOCK_ADD_RECENT_EMOJI',
            }, {
                args: [newPost, files],
                type: 'MOCK_CREATE_POST',
            }, {
                args: ['draft_current_channel_id', null],
                type: 'MOCK_SET_GLOBAL_ITEM',
            }];

            await testStore.dispatch(Actions.createPost(newPost, files));
            expect(testStore.getActions()).toEqual(immediateExpectedState);
        });
    });

    test('addReaction', async () => {
        const testStore = await mockStore(initialState);

        await testStore.dispatch(Actions.addReaction('post_id_1', 'emoji_name_1'));
        expect(testStore.getActions()).toEqual([
            {args: ['post_id_1', 'emoji_name_1'], type: 'MOCK_ADD_REACTION'},
            {args: ['emoji_name_1'], type: 'MOCK_ADD_RECENT_EMOJI'},
        ]);
    });

    test('flagPost', async () => {
        const testStore = await mockStore({...initialState, views: {rhs: {rhsState: RHSStates.FLAG}}});

        const post = testStore.getState().entities.posts.posts[latestPost.id];

        await testStore.dispatch(Actions.flagPost(post.id));
        expect(testStore.getActions()).toEqual([
            {args: [post.id], type: 'MOCK_FLAG_POST'},
            {data: {posts: {[post.id]: post}, order: [post.id]}, type: SearchTypes.RECEIVED_SEARCH_POSTS},
        ]);
    });

    test('unflagPost', async () => {
        const testStore = await mockStore({views: {rhs: {rhsState: RHSStates.FLAG}}, entities: {...initialState.entities, search: {results: [latestPost.id]}}});

        const post = testStore.getState().entities.posts.posts[latestPost.id];

        await testStore.dispatch(Actions.unflagPost(post.id));
        expect(testStore.getActions()).toEqual([
            {args: [post.id], type: 'MOCK_UNFLAG_POST'},
            {data: {posts: [], order: []}, type: SearchTypes.RECEIVED_SEARCH_POSTS},
        ]);
    });

    test('pinPost', async () => {
        const testStore = await mockStore({...initialState, views: {rhs: {rhsState: RHSStates.PIN}}});

        const post = testStore.getState().entities.posts.posts[latestPost.id];

        await testStore.dispatch(Actions.pinPost(post.id));
        expect(testStore.getActions()).toEqual([
            {args: [post.id], type: 'MOCK_PIN_POST'},
            {data: {posts: {[post.id]: post}, order: [post.id]}, type: SearchTypes.RECEIVED_SEARCH_POSTS},
        ]);
    });

    test('unpinPost', async () => {
        const testStore = await mockStore({views: {rhs: {rhsState: RHSStates.PIN}}, entities: {...initialState.entities, search: {results: [latestPost.id]}}});

        const post = testStore.getState().entities.posts.posts[latestPost.id];

        await testStore.dispatch(Actions.unpinPost(post.id));
        expect(testStore.getActions()).toEqual([
            {args: [post.id], type: 'MOCK_UNPIN_POST'},
            {data: {posts: [], order: []}, type: SearchTypes.RECEIVED_SEARCH_POSTS},
        ]);
    });
});
