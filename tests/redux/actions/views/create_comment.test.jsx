// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
    addReaction,
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
import * as GlobalActions from 'actions/global_actions.jsx';
import * as ChannelActions from 'actions/channel_actions.jsx';
import {StoragePrefixes} from 'utils/constants';

const mockStore = configureStore([thunk]);

jest.mock('mattermost-redux/actions/posts', () => ({
    addReaction: (...args) => ({type: 'MOCK_ADD_REACTION', args}),
    removeReaction: (...args) => ({type: 'MOCK_REMOVE_REACTION', args}),
    addMessageIntoHistory: (...args) => ({type: 'MOCK_ADD_MESSAGE_INTO_HISTORY', args}),
    moveHistoryIndexBack: (...args) => ({type: 'MOCK_MOVE_MESSAGE_HISTORY_BACK', args}),
    moveHistoryIndexForward: (...args) => ({type: 'MOCK_MOVE_MESSAGE_HISTORY_FORWARD', args}),
}));

jest.mock('dispatcher/app_dispatcher.jsx', () => ({
    handleViewAction: jest.fn(),
    register: jest.fn(),
}));

jest.mock('actions/channel_actions.jsx', () => ({
    executeCommand: jest.fn(),
}));

jest.mock('actions/global_actions.jsx', () => ({
    emitUserCommentedEvent: jest.fn(),
}));

jest.mock('actions/post_actions.jsx', () => ({
    createPost: jest.fn(),
    setEditingPost: (...args) => ({type: 'MOCK_SET_EDITING_POST', args}),
    emitEmojiPosted: jest.fn(),
}));

jest.mock('actions/storage', () => ({
    setGlobalItem: (...args) => ({type: 'MOCK_SET_GLOBAL_ITEM', args}),
    actionOnGlobalItemsWithPrefix: (...args) => ({type: 'MOCK_ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX', args}),
}));

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
                    [channelId]: [latestPostId],
                },
                postsInThread: {},
                messagesHistory: {
                    index: {
                        [Posts.MESSAGE_TYPES.COMMENT]: 0,
                    },
                    messages: ['test message'],
                },
            },
            users: {
                currentUserId,
            },
            teams: {
                currentTeamId: teamId,
            },
            emojis: {
                customEmoji: {},
            },
        },
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
                expect.arrayContaining(testStore.getActions())
            );
        });

        test('it stores history message in draft', () => {
            const onMoveHistoryIndex = makeOnMoveHistoryIndex(rootId, -1);

            store.dispatch(onMoveHistoryIndex());

            const testStore = mockStore(initialState);

            testStore.dispatch(updateCommentDraft(rootId, {message: 'test message', fileInfos: [], uploadsInProgress: []}));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions())
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

        test('it calls GlobalActions.emitUserCommentedEvent with post', () => {
            store.dispatch(submitPost(channelId, rootId, draft));

            expect(GlobalActions.emitUserCommentedEvent).toHaveBeenCalled();

            expect(lastCall(GlobalActions.emitUserCommentedEvent.mock.calls)[0]).toEqual(
                expect.objectContaining(post)
            );
        });

        test('it call PostActions.createPost with post', () => {
            store.dispatch(submitPost(channelId, rootId, draft));

            expect(PostActions.createPost).toHaveBeenCalled();

            expect(lastCall(PostActions.createPost.mock.calls)[0]).toEqual(
                expect.objectContaining(post)
            );

            expect(lastCall(PostActions.createPost.mock.calls)[1]).toBe(draft.fileInfos);
        });
    });

    describe('submitReaction', () => {
        test('it adds a reaction when action is +', () => {
            store.dispatch(submitReaction('', '+', ''));

            const testStore = mockStore(initialState);
            testStore.dispatch(addReaction('', ''));
            expect(PostActions.emitEmojiPosted).toHaveBeenCalled();

            expect(store.getActions()).toEqual(testStore.getActions());
        });

        test('it removes a reaction when action is -', () => {
            store.dispatch(submitReaction('', '-', ''));

            const testStore = mockStore(initialState);
            testStore.dispatch(removeReaction('', ''));
            expect(PostActions.emitEmojiPosted).not.toHaveBeenCalled();

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

        const draft = {message: 'test msg'};

        test('it calls ChannelActions.executeCommand', () => {
            store.dispatch(submitCommand(channelId, rootId, draft));

            expect(ChannelActions.executeCommand).toHaveBeenCalled();

            // First argument
            expect(lastCall(ChannelActions.executeCommand.mock.calls)[0]).toEqual(draft.message);

            // Second argument
            expect(lastCall(ChannelActions.executeCommand.mock.calls)[1]).toEqual(args);
        });

        test('it calls submitPost on error.sendMessage', () => {
            jest.mock('actions/channel_actions.jsx', () => ({
                executeCommand: jest.fn((message, _args, resolve, reject) => reject({sendMessage: 'test'})),
            }));

            jest.resetModules();

            const {submitCommand: remockedSubmitCommand} = require('actions/views/create_comment');

            store.dispatch(remockedSubmitCommand(channelId, rootId, draft));

            const testStore = mockStore(initialState);
            testStore.dispatch(submitPost(channelId, rootId, draft));

            expect(store.getActions()).toEqual(testStore.getActions());
        });
    });

    describe('makeOnSubmit', () => {
        const onSubmit = makeOnSubmit(channelId, rootId, latestPostId);

        test('it adds message into history', () => {
            store.dispatch(onSubmit());

            const testStore = mockStore(initialState);
            testStore.dispatch(addMessageIntoHistory(''));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions())
            );
        });

        test('it clears comment draft', () => {
            store.dispatch(onSubmit());

            const testStore = mockStore(initialState);
            testStore.dispatch(updateCommentDraft(rootId, null));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions())
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
                expect.arrayContaining(testStore.getActions())
            );
        });

        test('it submits a command when message is /away', () => {
            store = mockStore({
                ...initialState,
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
            });

            store.dispatch(onSubmit());

            const testStore = mockStore(initialState);
            testStore.dispatch(submitCommand(channelId, rootId, {message: '/away', fileInfos: [], uploadsInProgress: []}));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions())
            );
        });

        test('it submits a regular post when message is something else', () => {
            store = mockStore({
                ...initialState,
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
            });

            store.dispatch(onSubmit());

            const testStore = mockStore(initialState);
            testStore.dispatch(submitPost(channelId, rootId, {message: 'test msg', fileInfos: [], uploadsInProgress: []}));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions())
            );
        });
    });

    describe('makeOnEditLatestPost', () => {
        const onEditLatestPost = makeOnEditLatestPost(channelId, rootId);

        test('it dispatches the correct actions', () => {
            store.dispatch(onEditLatestPost());

            const testStore = mockStore(initialState);
            testStore.dispatch(PostActions.setEditingPost(
                latestPostId,
                0,
                'reply_textbox',
                'Comment',
                true
            ));

            expect(store.getActions()).toEqual(testStore.getActions());
        });
    });
});
