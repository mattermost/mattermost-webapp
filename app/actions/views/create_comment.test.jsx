// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
    removeReaction,
    addMessageIntoHistory,
    moveHistoryIndexBack,
} from 'mattermost-redux/actions/posts';
import {Posts} from 'mattermost-redux/constants';

import {
    clearCommentDraftUploads,
    updateCommentDraft,
    makeOnMoveHistoryIndex,
    submitPost,
    submitReaction,
    submitCommand,
    makeOnSubmit,
    makeOnEditLatestPost,
} from 'actions/views/create_comment';
import {setGlobalItem, actionOnGlobalItemsWithPrefix} from 'actions/storage';
import * as PostActions from 'actions/post_actions.jsx';
import {executeCommand} from 'actions/command';
import * as HookActions from 'actions/hooks';
import {StoragePrefixes} from 'utils/constants';

/* eslint-disable global-require */

const mockStore = configureStore([thunk]);

jest.mock('mattermost-redux/actions/posts', () => ({
    removeReaction: (...args) => ({type: 'MOCK_REMOVE_REACTION', args}),
    addMessageIntoHistory: (...args) => ({type: 'MOCK_ADD_MESSAGE_INTO_HISTORY', args}),
    moveHistoryIndexBack: (...args) => ({type: 'MOCK_MOVE_MESSAGE_HISTORY_BACK', args}),
    moveHistoryIndexForward: (...args) => ({type: 'MOCK_MOVE_MESSAGE_HISTORY_FORWARD', args}),
}));

jest.mock('dispatcher/app_dispatcher.jsx', () => ({
    handleViewAction: jest.fn(),
    register: jest.fn(),
}));

jest.mock('actions/command', () => ({
    executeCommand: jest.fn((...args) => ({type: 'MOCK_ACTIONS_COMMAND_EXECUTE', args})),
}));

jest.mock('actions/global_actions.jsx', () => ({
    emitUserCommentedEvent: jest.fn(),
}));

jest.mock('actions/hooks', () => ({
    runMessageWillBePostedHooks: jest.fn((post) => () => ({data: post})),
    runSlashCommandWillBePostedHooks: jest.fn((message, args) => () => ({data: {message, args}})),
}));

jest.mock('actions/post_actions.jsx', () => ({
    addReaction: (...args) => ({type: 'MOCK_ADD_REACTION', args}),
    createPost: jest.fn(() => ({type: 'MOCK_CREATE_POST'})),
    setEditingPost: (...args) => ({type: 'MOCK_SET_EDITING_POST', args}),
}));

jest.mock('actions/storage', () => {
    const original = jest.requireActual('actions/storage');
    return {
        ...original,
        setGlobalItem: (...args) => ({type: 'MOCK_SET_GLOBAL_ITEM', args}),
        actionOnGlobalItemsWithPrefix: (...args) => ({type: 'MOCK_ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX', args}),
    };
});

function lastCall(calls) {
    return calls[calls.length - 1];
}

const rootId = 'fc234c34c23';
const currentUserId = '34jrnfj43';
const teamId = '4j5nmn4j3';
const channelId = '4j5j4k3k34j4';
const latestPostId = rootId;

describe('rhs view actions', () => {
    const initialState = {
        entities: {
            posts: {
                posts: {
                    [latestPostId]: {
                        id: latestPostId,
                        user_id: currentUserId,
                        message: 'test msg',
                        channel_id: channelId,
                    },
                },
                postsInChannel: {
                    [channelId]: [
                        {order: [latestPostId], recent: true},
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
            preferences: {
                myPreferences: {},
            },
            users: {
                currentUserId,
                profiles: {
                    [currentUserId]: {id: currentUserId},
                },
            },
            teams: {
                currentTeamId: teamId,
            },
            emojis: {
                customEmoji: {},
            },
            general: {
                config: {
                    EnableCustomEmoji: 'true',
                },
            },
        },
        storage: {
            storage: {
                [`${StoragePrefixes.COMMENT_DRAFT}${latestPostId}`]: {
                    value: {
                        message: '',
                        fileInfos: [],
                        uploadsInProgress: [],
                    },
                    timestamp: new Date(),
                },
            },
        },
    };

    let store;

    beforeEach(() => {
        store = mockStore(initialState);
    });

    describe('clearCommentDraftUploads', () => {
        test('it calls actionOnGlobalItemsWithPrefix action correctly', () => {
            store.dispatch(clearCommentDraftUploads());

            const actions = store.getActions();

            expect(actions.length).toBe(1);

            const callback = actions[0].args[1];

            // make sure callback is a function which clears uploadsInProgress
            expect(typeof callback).toBe('function');

            const draft = {message: 'test msg', uploadsInProgress: [3, 4], fileInfos: [{id: 1}, {id: 2}]};

            expect(callback(null, draft)).toEqual({...draft, uploadsInProgress: []});

            const testStore = mockStore(initialState);

            testStore.dispatch(actionOnGlobalItemsWithPrefix(StoragePrefixes.COMMENT_DRAFT, callback));

            expect(store.getActions()).toEqual(testStore.getActions());
        });
    });

    describe('updateCommentDraft', () => {
        const draft = {message: 'test msg', fileInfos: [{id: 1}], uploadsInProgress: [2, 3]};

        test('it calls setGlobalItem action correctly', () => {
            store.dispatch(updateCommentDraft(rootId, draft));

            const testStore = mockStore(initialState);

            testStore.dispatch(setGlobalItem(`${StoragePrefixes.COMMENT_DRAFT}${rootId}`, draft));

            expect(store.getActions()).toEqual(testStore.getActions());
        });
    });

    describe('makeOnMoveHistoryIndex', () => {
        test('it moves comment history index back', () => {
            const onMoveHistoryIndex = makeOnMoveHistoryIndex(rootId, -1);

            store.dispatch(onMoveHistoryIndex());

            const testStore = mockStore(initialState);

            testStore.dispatch(moveHistoryIndexBack(Posts.MESSAGE_TYPES.COMMENT));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions()),
            );
        });

        test('it stores history message in draft', () => {
            const onMoveHistoryIndex = makeOnMoveHistoryIndex(rootId, -1);

            store.dispatch(onMoveHistoryIndex());

            const testStore = mockStore(initialState);

            testStore.dispatch(updateCommentDraft(rootId, {message: 'test message', fileInfos: [], uploadsInProgress: []}));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions()),
            );
        });
    });

    describe('submitPost', () => {
        const draft = {message: '', fileInfos: []};

        const post = {
            file_ids: [],
            message: draft.message,
            channel_id: channelId,
            root_id: rootId,
            parent_id: rootId,
            user_id: currentUserId,
        };

        test('it call PostActions.createPost with post', async () => {
            await store.dispatch(submitPost(channelId, rootId, draft));

            expect(HookActions.runMessageWillBePostedHooks).toHaveBeenCalled();
            expect(PostActions.createPost).toHaveBeenCalled();

            expect(lastCall(PostActions.createPost.mock.calls)[0]).toEqual(
                expect.objectContaining(post),
            );

            expect(lastCall(PostActions.createPost.mock.calls)[1]).toBe(draft.fileInfos);
        });

        test('it does not call PostActions.createPost when hooks fail', async () => {
            HookActions.runMessageWillBePostedHooks.mockImplementation(() => () => ({error: {message: 'An error occurred'}}));

            await store.dispatch(submitPost(channelId, rootId, draft));

            expect(HookActions.runMessageWillBePostedHooks).toHaveBeenCalled();
            expect(PostActions.createPost).not.toHaveBeenCalled();
        });
    });

    describe('submitReaction', () => {
        test('it adds a reaction when action is +', () => {
            store.dispatch(submitReaction('post_id_1', '+', 'emoji_name_1'));

            const testStore = mockStore(initialState);
            testStore.dispatch(PostActions.addReaction('post_id_1', 'emoji_name_1'));
            expect(store.getActions()).toEqual(testStore.getActions());
        });

        test('it removes a reaction when action is -', () => {
            store.dispatch(submitReaction('post_id_1', '-', 'emoji_name_1'));

            const testStore = mockStore(initialState);
            testStore.dispatch(removeReaction('post_id_1', 'emoji_name_1'));

            expect(store.getActions()).toEqual(testStore.getActions());
        });
    });

    describe('submitCommand', () => {
        const args = {
            channel_id: channelId,
            team_id: teamId,
            root_id: rootId,
            parent_id: rootId,
        };

        const draft = {message: '/test msg'};

        test('it calls executeCommand', async () => {
            await store.dispatch(submitCommand(channelId, rootId, draft));

            expect(HookActions.runSlashCommandWillBePostedHooks).toHaveBeenCalled();
            expect(executeCommand).toHaveBeenCalled();

            // First argument
            expect(lastCall(executeCommand.mock.calls)[0]).toEqual(draft.message);

            // Second argument
            expect(lastCall(executeCommand.mock.calls)[1]).toEqual(args);
        });

        test('it does not call executeComaand when hooks fail', async () => {
            HookActions.runSlashCommandWillBePostedHooks.mockImplementation(() => () => ({error: {message: 'An error occurred'}}));

            await store.dispatch(submitCommand(channelId, rootId, draft));

            expect(HookActions.runSlashCommandWillBePostedHooks).toHaveBeenCalled();
            expect(executeCommand).not.toHaveBeenCalled();
        });

        test('it calls submitPost on error.sendMessage', async () => {
            jest.mock('actions/channel_actions.jsx', () => ({
                executeCommand: jest.fn((message, _args, resolve, reject) => reject({sendMessage: 'test'})),
            }));

            jest.resetModules();

            const {submitCommand: remockedSubmitCommand} = require('actions/views/create_comment');

            await store.dispatch(remockedSubmitCommand(channelId, rootId, draft));

            const expectedActions = [{args: ['/test msg', {channel_id: '4j5j4k3k34j4', parent_id: 'fc234c34c23', root_id: 'fc234c34c23', team_id: '4j5nmn4j3'}], type: 'MOCK_ACTIONS_COMMAND_EXECUTE'}];
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    describe('makeOnSubmit', () => {
        const onSubmit = makeOnSubmit(channelId, rootId, latestPostId);

        test('it adds message into history', () => {
            store.dispatch(onSubmit());

            const testStore = mockStore(initialState);
            testStore.dispatch(addMessageIntoHistory(''));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions()),
            );
        });

        test('it clears comment draft', () => {
            store.dispatch(onSubmit());

            const testStore = mockStore(initialState);
            testStore.dispatch(updateCommentDraft(rootId, null));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions()),
            );
        });

        test('it submits a reaction when message is +:smile:', () => {
            store = mockStore({
                ...initialState,
                storage: {
                    storage: {
                        [`${StoragePrefixes.COMMENT_DRAFT}${latestPostId}`]: {
                            value: {
                                message: '+:smile:',
                                fileInfos: [],
                                uploadsInProgress: [],
                            },
                            timestamp: new Date(),
                        },
                    },
                },
            });

            store.dispatch(onSubmit());

            const testStore = mockStore(initialState);
            testStore.dispatch(submitReaction(latestPostId, '+', 'smile'));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions()),
            );
        });

        test('it submits a command when message is /away', () => {
            store = mockStore({
                ...initialState,
                storage: {
                    storage: {
                        [`${StoragePrefixes.COMMENT_DRAFT}${latestPostId}`]: {
                            value: {
                                message: '/away',
                                fileInfos: [],
                                uploadsInProgress: [],
                            },
                            timestamp: new Date(),
                        },
                    },
                },
            });

            store.dispatch(onSubmit());

            const testStore = mockStore(initialState);
            testStore.dispatch(submitCommand(channelId, rootId, {message: '/away', fileInfos: [], uploadsInProgress: []}));

            const commandActions = [{args: ['/away', {channel_id: '4j5j4k3k34j4', parent_id: 'fc234c34c23', root_id: 'fc234c34c23', team_id: '4j5nmn4j3'}], type: 'MOCK_ACTIONS_COMMAND_EXECUTE'}];
            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions()),
                expect.arrayContaining(commandActions),
            );
        });

        test('it submits a regular post when options.ignoreSlash is true', () => {
            store = mockStore({
                ...initialState,
                storage: {
                    storage: {
                        [`${StoragePrefixes.COMMENT_DRAFT}${latestPostId}`]: {
                            value: {
                                message: '/fakecommand',
                                fileInfos: [],
                                uploadsInProgress: [],
                            },
                            timestamp: new Date(),
                        },
                    },
                },
            });

            store.dispatch(onSubmit({ignoreSlash: true}));

            const testStore = mockStore(initialState);
            testStore.dispatch(submitPost(channelId, rootId, {message: '/fakecommand', fileInfos: [], uploadsInProgress: []}));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions()),
                expect.arrayContaining([{args: ['/fakecommand'], type: 'MOCK_ADD_MESSAGE_INTO_HISTORY'}]),
            );
        });

        test('it submits a regular post when message is something else', () => {
            store = mockStore({
                ...initialState,
                storage: {
                    storage: {
                        [`${StoragePrefixes.COMMENT_DRAFT}${latestPostId}`]: {
                            value: {
                                message: 'test msg',
                                fileInfos: [],
                                uploadsInProgress: [],
                            },
                            timestamp: new Date(),
                        },
                    },
                },
            });

            store.dispatch(onSubmit());

            const testStore = mockStore(initialState);
            testStore.dispatch(submitPost(channelId, rootId, {message: 'test msg', fileInfos: [], uploadsInProgress: []}));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions()),
                expect.arrayContaining([{args: ['test msg'], type: 'MOCK_ADD_MESSAGE_INTO_HISTORY'}]),
            );
        });
    });

    describe('makeOnEditLatestPost', () => {
        const onEditLatestPost = makeOnEditLatestPost(channelId, rootId);

        test('it dispatches the correct actions', () => {
            store.dispatch(onEditLatestPost());

            expect(store.getActions()).toEqual([
                PostActions.setEditingPost(
                    latestPostId,
                    0,
                    'reply_textbox',
                    'Comment',
                    true,
                ),
            ]);
        });
    });
});
