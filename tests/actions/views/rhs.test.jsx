// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  addReaction,
  removeReaction,
  addMessageIntoHistory,
  moveHistoryIndexBack
} from 'mattermost-redux/actions/posts';

import {Posts} from 'mattermost-redux/constants';

import {
    updateCommentDraft,
    makeOnMoveHistoryIndex,
    submitPost,
    submitReaction,
    submitCommand,
    makeOnSubmit,
    makeOnEditLatestPost
} from 'actions/views/rhs';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import * as PostActions from 'actions/post_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as ChannelActions from 'actions/channel_actions.jsx';
import PostStore from 'stores/post_store.jsx';

import {ActionTypes} from 'utils/constants.jsx';

const mockStore = configureStore([thunk]);

jest.mock('mattermost-redux/actions/posts', () => ({
    addReaction: (...args) => ({type: 'ADD_REACTION', args}),
    removeReaction: (...args) => ({type: 'REMOVE_REACTION', args}),
    addMessageIntoHistory: (...args) => ({type: 'ADD_MESSAGE_INTO_HISTORY', args}),
    moveHistoryIndexBack: (...args) => ({type: 'MOVE_MESSAGE_HISTORY_BACK', args}),
    moveHistoryIndexForward: (...args) => ({type: 'MOVE_MESSAGE_HISTORY_FORWARD', args})
}));

jest.mock('dispatcher/app_dispatcher.jsx', () => ({
    handleViewAction: jest.fn(),
    register: jest.fn()
}));

jest.mock('actions/channel_actions.jsx', () => ({
    executeCommand: jest.fn()
}));

jest.mock('actions/global_actions.jsx', () => ({
    emitUserCommentedEvent: jest.fn()
}));

jest.mock('actions/post_actions.jsx', () => ({
    createPost: jest.fn()
}));

jest.mock('stores/post_store.jsx', () => {
    return {
        storeCommentDraft: jest.fn(),
        getCommentDraft: jest.fn(() => ({message: '', fileInfos: [], uploadsInProgress: []}))
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
                        channel_id: channelId
                    }
                },
                postsInChannel: {
                    [channelId]: [latestPostId]
                },
                messagesHistory: {
                    index: {
                        [Posts.MESSAGE_TYPES.COMMENT]: 0
                    },
                    messages: ['test message']
                }
            },
            users: {
                currentUserId
            },
            teams: {
                currentTeamId: teamId
            },
            emojis: {
                customEmoji: {}
            }
        }
    };

    let store;

    beforeEach(() => {
        store = mockStore(initialState);
    });

    describe('updateCommentDraft', () => {
        const draft = {};

        test('it calls PostStore.storeCommentDraft', () => {
            store.dispatch(updateCommentDraft(rootId, draft));

            expect(PostStore.storeCommentDraft).toHaveBeenCalled();

            // First argument
            expect(lastCall(PostStore.storeCommentDraft.mock.calls)[0]).toBe(rootId);

            // Second argument
            expect(lastCall(PostStore.storeCommentDraft.mock.calls)[1]).toBe(draft);
        });

        test('it dispatches POST_DRAFT_UPDATED', () => {
            store.dispatch(updateCommentDraft(rootId, draft));

            const actions = store.getActions();
            const expectedPayload = expect.objectContaining({type: ActionTypes.POST_DRAFT_UPDATED});
            expect(actions).toEqual([expectedPayload]);
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
            user_id: currentUserId
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

            expect(store.getActions()).toEqual(testStore.getActions());
        });

        test('it removes a reaction when action is -', () => {
            store.dispatch(submitReaction('', '-', ''));

            const testStore = mockStore(initialState);
            testStore.dispatch(removeReaction('', ''));

            expect(store.getActions()).toEqual(testStore.getActions());
        });
    });

    describe('submitCommand', () => {
        const args = {
            channel_id: channelId,
            team_id: teamId,
            root_id: rootId,
            parent_id: rootId
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
                executeCommand: jest.fn((message, _args, resolve, reject) => reject({sendMessage: 'test'}))
            }));

            jest.resetModules();

            const {submitCommand: _submitCommand} = require('actions/views/rhs');

            store.dispatch(_submitCommand(channelId, rootId, draft));

            const testStore = mockStore(initialState);
            testStore.dispatch(submitPost(channelId, rootId, draft));

            expect(store.getActions()).toEqual(testStore.getActions());
        });
    });

    describe('makeOnSubmit', () => {
        let onSubmit = makeOnSubmit(channelId, rootId, latestPostId);

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
            jest.mock('stores/post_store.jsx', () => {
                return {
                    storeCommentDraft: jest.fn(),
                    getCommentDraft: jest.fn(() => ({message: '+:smile:', fileInfos: [], uploadsInProgress: []}))
                };
            });

            jest.resetModules();

            const {makeOnSubmit: _makeOnSubmit} = require('actions/views/rhs');

            onSubmit = _makeOnSubmit(channelId, rootId, latestPostId);

            store.dispatch(onSubmit());

            const testStore = mockStore(initialState);
            testStore.dispatch(submitReaction(latestPostId, '+', 'smile'));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions())
            );
        });

        test('it submits a command when message is /away', () => {
            jest.mock('stores/post_store.jsx', () => {
                return {
                    storeCommentDraft: jest.fn(),
                    getCommentDraft: jest.fn(() => ({message: '/away', fileInfos: [], uploadsInProgress: []}))
                };
            });

            jest.resetModules();

            const {makeOnSubmit: _makeOnSubmit} = require('actions/views/rhs');

            onSubmit = _makeOnSubmit(channelId, rootId, latestPostId);

            store.dispatch(onSubmit());

            const testStore = mockStore(initialState);
            testStore.dispatch(submitCommand(channelId, rootId, {message: '/away', fileInfos: [], uploadsInProgress: []}));

            expect(store.getActions()).toEqual(
                expect.arrayContaining(testStore.getActions())
            );
        });

        test('it submits a regular post when message is something else', () => {
            jest.mock('stores/post_store.jsx', () => {
                return {
                    storeCommentDraft: jest.fn(),
                    getCommentDraft: jest.fn(() => ({message: 'test msg', fileInfos: [], uploadsInProgress: []}))
                };
            });

            jest.resetModules();

            const {makeOnSubmit: _makeOnSubmit} = require('actions/views/rhs');

            onSubmit = _makeOnSubmit(channelId, rootId, latestPostId);

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

        const config = {
            type: ActionTypes.RECEIVED_EDIT_POST,
            refocusId: '#reply_textbox',
            title: 'Comment',
            message: 'test msg',
            postId: latestPostId,
            channelId,
            comments: 0
        };

        test('it calls AppDispatcher.handleViewAction', () => {
            store.dispatch(onEditLatestPost());

            expect(AppDispatcher.handleViewAction).toHaveBeenCalled();

            expect(lastCall(AppDispatcher.handleViewAction.mock.calls)[0]).toEqual(
                expect.objectContaining(config)
            );
        });
    });
});

/*
export function makeOnEditLatestPost(channelId, rootId) {
    const getCurrentUsersLatestPost = makeGetCurrentUsersLatestPost(channelId, rootId);
    const getCommentCount = makeGetCommentCountForPost();

    return () => (dispatch, getState) => {
        const state = getState();

        const lastPost = getCurrentUsersLatestPost(state);

        if (!lastPost) {
            return;
        }

        AppDispatcher.handleViewAction({
            type: ActionTypes.RECEIVED_EDIT_POST,
            refocusId: '#reply_textbox',
            title: Utils.localizeMessage('create_comment.commentTitle', 'Comment'),
            message: lastPost.message,
            postId: lastPost.id,
            channelId: lastPost.channel_id,
            comments: getCommentCount(state, {post: lastPost})
        });
    };
}
*/
