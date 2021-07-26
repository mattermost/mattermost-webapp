// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4, DEFAULT_LIMIT_AFTER, DEFAULT_LIMIT_BEFORE} from 'mattermost-redux/client';
import {General, Preferences, Posts} from '../constants';
import {PostTypes, ChannelTypes, FileTypes, IntegrationTypes} from 'mattermost-redux/action_types';

import {getCurrentChannelId, getMyChannelMember as getMyChannelMemberSelector} from 'mattermost-redux/selectors/entities/channels';
import {getCustomEmojisByName as selectCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import * as Selectors from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId, getUsersByUsername} from 'mattermost-redux/selectors/entities/users';

import {isCombinedUserActivityPost} from 'mattermost-redux/utils/post_list';

import {Action, ActionResult, batchActions, DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {ChannelUnread} from 'mattermost-redux/types/channels';
import {GlobalState} from 'mattermost-redux/types/store';
import {Post, PostList} from 'mattermost-redux/types/posts';
import {Reaction} from 'mattermost-redux/types/reactions';
import {UserProfile} from 'mattermost-redux/types/users';
import {Dictionary} from 'mattermost-redux/types/utilities';
import {isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {getProfilesByIds, getProfilesByUsernames, getStatusesByIds} from './users';
import {
    deletePreferences,
    savePreferences,
} from './preferences';
import {bindClientFunc, forceLogoutIfNecessary} from './helpers';
import {logError} from './errors';
import {systemEmojis, getCustomEmojiByName, getCustomEmojisByName} from './emojis';
import {selectChannel} from './channels';

// receivedPost should be dispatched after a single post from the server. This typically happens when an existing post
// is updated.
export function receivedPost(post: Post) {
    return {
        type: PostTypes.RECEIVED_POST,
        data: post,
    };
}

// receivedNewPost should be dispatched when receiving a newly created post or when sending a request to the server
// to make a new post.
export function receivedNewPost(post: Post, crtEnabled: boolean) {
    return {
        type: PostTypes.RECEIVED_NEW_POST,
        data: post,
        features: {crtEnabled},
    };
}

// receivedPosts should be dispatched when receiving multiple posts from the server that may or may not be ordered.
// This will typically be used alongside other actions like receivedPostsAfter which require the posts to be ordered.
export function receivedPosts(posts: PostList) {
    return {
        type: PostTypes.RECEIVED_POSTS,
        data: posts,
    };
}

// receivedPostsAfter should be dispatched when receiving an ordered list of posts that come before a given post.
export function receivedPostsAfter(posts: PostList, channelId: string, afterPostId: string, recent = false) {
    return {
        type: PostTypes.RECEIVED_POSTS_AFTER,
        channelId,
        data: posts,
        afterPostId,
        recent,
    };
}

// receivedPostsBefore should be dispatched when receiving an ordered list of posts that come after a given post.
export function receivedPostsBefore(posts: PostList, channelId: string, beforePostId: string, oldest = false) {
    return {
        type: PostTypes.RECEIVED_POSTS_BEFORE,
        channelId,
        data: posts,
        beforePostId,
        oldest,
    };
}

// receivedPostsSince should be dispatched when receiving a list of posts that have been updated since a certain time.
// Due to how the API endpoint works, some of these posts will be ordered, but others will not, so this needs special
// handling from the reducers.
export function receivedPostsSince(posts: PostList, channelId: string) {
    return {
        type: PostTypes.RECEIVED_POSTS_SINCE,
        channelId,
        data: posts,
    };
}

// receivedPostsInChannel should be dispatched when receiving a list of ordered posts within a channel when the
// the adjacent posts are not known.
export function receivedPostsInChannel(posts: PostList, channelId: string, recent = false, oldest = false) {
    return {
        type: PostTypes.RECEIVED_POSTS_IN_CHANNEL,
        channelId,
        data: posts,
        recent,
        oldest,
    };
}

// receivedPostsInThread should be dispatched when receiving a list of unordered posts in a thread.
export function receivedPostsInThread(posts: PostList, rootId: string) {
    return {
        type: PostTypes.RECEIVED_POSTS_IN_THREAD,
        data: posts,
        rootId,
    };
}

// postDeleted should be dispatched when a post has been deleted and should be replaced with a "message deleted"
// placeholder. This typically happens when a post is deleted by another user.
export function postDeleted(post: Post) {
    return {
        type: PostTypes.POST_DELETED,
        data: post,
    };
}

// postRemoved should be dispatched when a post should be immediately removed. This typically happens when a post is
// deleted by the current user.
export function postRemoved(post: Post) {
    return {
        type: PostTypes.POST_REMOVED,
        data: post,
    };
}

export function getPost(postId: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let post;

        try {
            post = await Client4.getPost(postId);
            getProfilesAndStatusesForPosts([post], dispatch, getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: PostTypes.GET_POSTS_FAILURE, error},
                logError(error),
            ]));
            return {error};
        }

        dispatch(batchActions([
            receivedPost(post),
            {
                type: PostTypes.GET_POSTS_SUCCESS,
            },
        ]));

        return {data: post};
    };
}

export function createPost(post: Post, files: any[] = []) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const currentUserId = state.entities.users.currentUserId;

        const timestamp = Date.now();
        const pendingPostId = post.pending_post_id || `${currentUserId}:${timestamp}`;
        let actions: Action[] = [];

        if (Selectors.isPostIdSending(state, pendingPostId)) {
            return {data: true};
        }

        let newPost = {
            ...post,
            pending_post_id: pendingPostId,
            create_at: timestamp,
            update_at: timestamp,
            reply_count: 0,
        };

        if (post.root_id) {
            newPost.reply_count = Selectors.getPostRepliesCount(state, post.root_id) + 1;
        }

        // We are retrying a pending post that had files
        if (newPost.file_ids && !files.length) {
            files = newPost.file_ids.map((id) => state.entities.files.files[id]); // eslint-disable-line
        }

        if (files.length) {
            const fileIds = files.map((file) => file.id);

            newPost = {
                ...newPost,
                file_ids: fileIds,
            };

            actions.push({
                type: FileTypes.RECEIVED_FILES_FOR_POST,
                postId: pendingPostId,
                data: files,
            });
        }

        const crtEnabled = isCollapsedThreadsEnabled(getState());
        actions.push({
            type: PostTypes.RECEIVED_NEW_POST,
            data: {
                ...newPost,
                id: pendingPostId,
            },
            features: {crtEnabled},
        });

        dispatch(batchActions(actions, 'BATCH_CREATE_POST_INIT'));

        (async function createPostWrapper() {
            try {
                const created = await Client4.createPost({...newPost, create_at: 0});

                actions = [
                    receivedPost(created),
                    {
                        type: PostTypes.CREATE_POST_SUCCESS,
                    },
                    {
                        type: ChannelTypes.INCREMENT_TOTAL_MSG_COUNT,
                        data: {
                            channelId: newPost.channel_id,
                            amount: 1,
                            amountRoot: created.root_id === '' ? 1 : 0,
                        },
                    },
                    {
                        type: ChannelTypes.DECREMENT_UNREAD_MSG_COUNT,
                        data: {
                            channelId: newPost.channel_id,
                            amount: 1,
                            amountRoot: created.root_id === '' ? 1 : 0,
                        },
                    },
                ];

                if (files) {
                    actions.push({
                        type: FileTypes.RECEIVED_FILES_FOR_POST,
                        postId: created.id,
                        data: files,
                    });
                }

                dispatch(batchActions(actions, 'BATCH_CREATE_POST'));
            } catch (error) {
                const data = {
                    ...newPost,
                    id: pendingPostId,
                    failed: true,
                    update_at: Date.now(),
                };
                actions = [{type: PostTypes.CREATE_POST_FAILURE, error}];

                // If the failure was because: the root post was deleted or
                // TownSquareIsReadOnly=true then remove the post
                if (error.server_error_id === 'api.post.create_post.root_id.app_error' ||
                    error.server_error_id === 'api.post.create_post.town_square_read_only' ||
                    error.server_error_id === 'plugin.message_will_be_posted.dismiss_post'
                ) {
                    actions.push(removePost(data) as any);
                } else {
                    actions.push(receivedPost(data));
                }

                dispatch(batchActions(actions, 'BATCH_CREATE_POST_FAILED'));
            }
        }());

        return {data: true};
    };
}

export function createPostImmediately(post: Post, files: any[] = []) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const currentUserId = state.entities.users.currentUserId;
        const timestamp = Date.now();
        const pendingPostId = `${currentUserId}:${timestamp}`;

        let newPost: Post = {
            ...post,
            pending_post_id: pendingPostId,
            create_at: timestamp,
            update_at: timestamp,
            reply_count: 0,
        };

        if (post.root_id) {
            newPost.reply_count = Selectors.getPostRepliesCount(state, post.root_id) + 1;
        }

        if (files.length) {
            const fileIds = files.map((file) => file.id);

            newPost = {
                ...newPost,
                file_ids: fileIds,
            };

            dispatch({
                type: FileTypes.RECEIVED_FILES_FOR_POST,
                postId: pendingPostId,
                data: files,
            });
        }

        dispatch(receivedNewPost({
            ...newPost,
            id: pendingPostId,
        }, isCollapsedThreadsEnabled(state)));

        try {
            const created = await Client4.createPost({...newPost, create_at: 0});
            newPost.id = created.id;
            newPost.reply_count = created.reply_count;
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: PostTypes.CREATE_POST_FAILURE, data: newPost, error},
                removePost({
                    ...newPost,
                    id: pendingPostId,
                }) as any,
                logError(error),
            ]));
            return {error};
        }

        const actions: Action[] = [
            receivedPost(newPost),
            {
                type: PostTypes.CREATE_POST_SUCCESS,
            },
            {
                type: ChannelTypes.INCREMENT_TOTAL_MSG_COUNT,
                data: {
                    channelId: newPost.channel_id,
                    amount: 1,
                    amountRoot: newPost.root_id === '' ? 1 : 0,
                },
            },
            {
                type: ChannelTypes.DECREMENT_UNREAD_MSG_COUNT,
                data: {
                    channelId: newPost.channel_id,
                    amount: 1,
                    amountRoot: newPost.root_id === '' ? 1 : 0,
                },
            },
        ];

        if (files) {
            actions.push({
                type: FileTypes.RECEIVED_FILES_FOR_POST,
                postId: newPost.id,
                data: files,
            });
        }

        dispatch(batchActions(actions));

        return {data: newPost};
    };
}

export function resetCreatePostRequest() {
    return {type: PostTypes.CREATE_POST_RESET_REQUEST};
}

export function deletePost(post: ExtendedPost) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const delPost = {...post};
        if (delPost.type === Posts.POST_TYPES.COMBINED_USER_ACTIVITY && delPost.system_post_ids) {
            delPost.system_post_ids.forEach((systemPostId) => {
                const systemPost = Selectors.getPost(state, systemPostId);
                if (systemPost) {
                    dispatch(deletePost(systemPost));
                }
            });
        } else {
            (async function deletePostWrapper() {
                try {
                    dispatch({
                        type: PostTypes.POST_DELETED,
                        data: delPost,
                    });

                    await Client4.deletePost(post.id);
                } catch (e) {
                    // Recovering from this state doesn't actually work. The deleteAndRemovePost action
                    // in the webapp needs to get an error in order to not call removePost, but then
                    // the delete modal needs to handle this to show something to the user. Since none
                    // of that ever worked (even with redux-offline in play), leave the behaviour here
                    // unresolved.
                    console.error('failed to delete post', e); // eslint-disable-line no-console
                }
            }());
        }

        return {data: true};
    };
}

export function editPost(post: Post) {
    return bindClientFunc({
        clientFunc: Client4.patchPost,
        onRequest: PostTypes.EDIT_POST_REQUEST,
        onSuccess: [PostTypes.RECEIVED_POST, PostTypes.EDIT_POST_SUCCESS],
        onFailure: PostTypes.EDIT_POST_FAILURE,
        params: [
            post,
        ],
    });
}

function getUnreadPostData(unreadChan: ChannelUnread, state: GlobalState) {
    const member = getMyChannelMemberSelector(state, unreadChan.channel_id);
    const delta = member ? member.msg_count - unreadChan.msg_count : unreadChan.msg_count;
    const deltaRoot = member ? member.msg_count_root - unreadChan.msg_count_root : unreadChan.msg_count_root;

    const data = {
        teamId: unreadChan.team_id,
        channelId: unreadChan.channel_id,
        msgCount: unreadChan.msg_count,
        mentionCount: unreadChan.mention_count,
        msgCountRoot: unreadChan.msg_count_root,
        mentionCountRoot: unreadChan.mention_count_root,
        lastViewedAt: unreadChan.last_viewed_at,
        deltaMsgs: delta,
        deltaMsgsRoot: deltaRoot,
    };

    return data;
}

export function setUnreadPost(userId: string, postId: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let state = getState();
        const post = Selectors.getPost(state, postId);
        let unreadChan;

        try {
            if (isCombinedUserActivityPost(postId)) {
                return {};
            }
            unreadChan = await Client4.markPostAsUnread(userId, postId);
            dispatch({
                type: ChannelTypes.ADD_MANUALLY_UNREAD,
                data: {
                    channelId: post.channel_id,
                },
            });
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            dispatch({
                type: ChannelTypes.REMOVE_MANUALLY_UNREAD,
                data: {
                    channelId: post.channel_id,
                },
            });
            return {error};
        }

        state = getState();
        const data = getUnreadPostData(unreadChan, state);
        dispatch({
            type: ChannelTypes.POST_UNREAD_SUCCESS,
            data,
        });
        return {data};
    };
}

export function pinPost(postId: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        dispatch({type: PostTypes.EDIT_POST_REQUEST});
        let posts;

        try {
            posts = await Client4.pinPost(postId);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: PostTypes.EDIT_POST_FAILURE, error},
                logError(error),
            ]));
            return {error};
        }

        const actions: Action[] = [
            {
                type: PostTypes.EDIT_POST_SUCCESS,
            },
        ];

        const post = Selectors.getPost(getState(), postId);
        if (post) {
            actions.push(
                receivedPost({
                    ...post,
                    is_pinned: true,
                    update_at: Date.now(),
                }),
                {
                    type: ChannelTypes.INCREMENT_PINNED_POST_COUNT,
                    id: post.channel_id,
                },
            );
        }

        dispatch(batchActions(actions));

        return {data: posts};
    };
}

export function unpinPost(postId: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        dispatch({type: PostTypes.EDIT_POST_REQUEST});
        let posts;

        try {
            posts = await Client4.unpinPost(postId);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: PostTypes.EDIT_POST_FAILURE, error},
                logError(error),
            ]));
            return {error};
        }

        const actions: Action[] = [
            {
                type: PostTypes.EDIT_POST_SUCCESS,
            },
        ];

        const post = Selectors.getPost(getState(), postId);
        if (post) {
            actions.push(
                receivedPost({
                    ...post,
                    is_pinned: false,
                    update_at: Date.now(),
                }),
                {
                    type: ChannelTypes.DECREMENT_PINNED_POST_COUNT,
                    id: post.channel_id,
                },
            );
        }

        dispatch(batchActions(actions));

        return {data: posts};
    };
}

export function addReaction(postId: string, emojiName: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const currentUserId = getState().entities.users.currentUserId;

        let reaction;
        try {
            reaction = await Client4.addReaction(currentUserId, postId, emojiName);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        dispatch({
            type: PostTypes.RECEIVED_REACTION,
            data: reaction,
        });

        return {data: true};
    };
}

export function removeReaction(postId: string, emojiName: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const currentUserId = getState().entities.users.currentUserId;

        try {
            await Client4.removeReaction(currentUserId, postId, emojiName);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        dispatch({
            type: PostTypes.REACTION_DELETED,
            data: {user_id: currentUserId, post_id: postId, emoji_name: emojiName},
        });

        return {data: true};
    };
}

export function getCustomEmojiForReaction(name: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const nonExistentEmoji = getState().entities.emojis.nonExistentEmoji;
        const customEmojisByName = selectCustomEmojisByName(getState());

        if (systemEmojis.has(name)) {
            return {data: true};
        }

        if (nonExistentEmoji.has(name)) {
            return {data: true};
        }

        if (customEmojisByName.has(name)) {
            return {data: true};
        }

        return dispatch(getCustomEmojiByName(name));
    };
}

export function getReactionsForPost(postId: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let reactions;
        try {
            reactions = await Client4.getReactionsForPost(postId);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        if (reactions && reactions.length > 0) {
            const nonExistentEmoji = getState().entities.emojis.nonExistentEmoji;
            const customEmojisByName = selectCustomEmojisByName(getState());
            const emojisToLoad = new Set<string>();

            reactions.forEach((r: Reaction) => {
                const name = r.emoji_name;

                if (systemEmojis.has(name)) {
                    // It's a system emoji, go the next match
                    return;
                }

                if (nonExistentEmoji.has(name)) {
                    // We've previously confirmed this is not a custom emoji
                    return;
                }

                if (customEmojisByName.has(name)) {
                    // We have the emoji, go to the next match
                    return;
                }

                emojisToLoad.add(name);
            });

            dispatch(getCustomEmojisByName(Array.from(emojisToLoad)));
        }

        dispatch(batchActions([
            {
                type: PostTypes.RECEIVED_REACTIONS,
                data: reactions,
                postId,
            },
        ]));

        return reactions;
    };
}

export function flagPost(postId: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const {currentUserId} = getState().entities.users;
        const preference = {
            user_id: currentUserId,
            category: Preferences.CATEGORY_FLAGGED_POST,
            name: postId,
            value: 'true',
        };

        Client4.trackEvent('action', 'action_posts_flag');

        return savePreferences(currentUserId, [preference])(dispatch);
    };
}

export function getPostThread(rootId: string, fetchThreads = true) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        dispatch({type: PostTypes.GET_POST_THREAD_REQUEST});
        const collapsedThreadsEnabled = isCollapsedThreadsEnabled(getState());
        let posts;
        try {
            posts = await Client4.getPostThread(rootId, fetchThreads, collapsedThreadsEnabled);
            getProfilesAndStatusesForPosts(posts.posts, dispatch, getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: PostTypes.GET_POST_THREAD_FAILURE, error},
                logError(error),
            ]));
            return {error};
        }

        dispatch(batchActions([
            receivedPosts(posts),
            receivedPostsInThread(posts, rootId),
            {
                type: PostTypes.GET_POST_THREAD_SUCCESS,
            },
        ]));

        return {data: posts};
    };
}

export function getPosts(channelId: string, page = 0, perPage = Posts.POST_CHUNK_SIZE, fetchThreads = true, collapsedThreadsExtended = false) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let posts;
        const collapsedThreadsEnabled = isCollapsedThreadsEnabled(getState());
        try {
            posts = await Client4.getPosts(channelId, page, perPage, fetchThreads, collapsedThreadsEnabled, collapsedThreadsExtended);
            getProfilesAndStatusesForPosts(posts.posts, dispatch, getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        dispatch(batchActions([
            receivedPosts(posts),
            receivedPostsInChannel(posts, channelId, page === 0, posts.prev_post_id === ''),
        ]));

        return {data: posts};
    };
}

export function getPostsUnread(channelId: string, fetchThreads = true, collapsedThreadsExtended = false) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const collapsedThreadsEnabled = isCollapsedThreadsEnabled(getState());
        const userId = getCurrentUserId(getState());
        let posts;
        try {
            posts = await Client4.getPostsUnread(channelId, userId, DEFAULT_LIMIT_BEFORE, DEFAULT_LIMIT_AFTER, fetchThreads, collapsedThreadsEnabled, collapsedThreadsExtended);
            getProfilesAndStatusesForPosts(posts.posts, dispatch, getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        dispatch(batchActions([
            receivedPosts(posts),
            receivedPostsInChannel(posts, channelId, posts.next_post_id === '', posts.prev_post_id === ''),
        ]));
        dispatch({
            type: PostTypes.RECEIVED_POSTS,
            data: posts,
            channelId,
        });

        return {data: posts};
    };
}

export function getPostsSince(channelId: string, since: number, fetchThreads = true, collapsedThreadsExtended = false) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let posts;
        try {
            const collapsedThreadsEnabled = isCollapsedThreadsEnabled(getState());
            posts = await Client4.getPostsSince(channelId, since, fetchThreads, collapsedThreadsEnabled, collapsedThreadsExtended);
            getProfilesAndStatusesForPosts(posts.posts, dispatch, getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        dispatch(batchActions([
            receivedPosts(posts),
            receivedPostsSince(posts, channelId),
            {
                type: PostTypes.GET_POSTS_SINCE_SUCCESS,
            },
        ]));

        return {data: posts};
    };
}

export function getPostsBefore(channelId: string, postId: string, page = 0, perPage = Posts.POST_CHUNK_SIZE, fetchThreads = true, collapsedThreadsExtended = false) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let posts;
        try {
            const collapsedThreadsEnabled = isCollapsedThreadsEnabled(getState());
            posts = await Client4.getPostsBefore(channelId, postId, page, perPage, fetchThreads, collapsedThreadsEnabled, collapsedThreadsExtended);
            getProfilesAndStatusesForPosts(posts.posts, dispatch, getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        dispatch(batchActions([
            receivedPosts(posts),
            receivedPostsBefore(posts, channelId, postId, posts.prev_post_id === ''),
        ]));

        return {data: posts};
    };
}

export function getPostsAfter(channelId: string, postId: string, page = 0, perPage = Posts.POST_CHUNK_SIZE, fetchThreads = true, collapsedThreadsExtended = false) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let posts;
        try {
            const collapsedThreadsEnabled = isCollapsedThreadsEnabled(getState());
            posts = await Client4.getPostsAfter(channelId, postId, page, perPage, fetchThreads, collapsedThreadsEnabled, collapsedThreadsExtended);
            getProfilesAndStatusesForPosts(posts.posts, dispatch, getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        dispatch(batchActions([
            receivedPosts(posts),
            receivedPostsAfter(posts, channelId, postId, posts.next_post_id === ''),
        ]));

        return {data: posts};
    };
}

export function getPostsAround(channelId: string, postId: string, perPage = Posts.POST_CHUNK_SIZE / 2, fetchThreads = true, collapsedThreadsExtended = false) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let after;
        let thread;
        let before;

        try {
            const collapsedThreadsEnabled = isCollapsedThreadsEnabled(getState());
            [after, thread, before] = await Promise.all([
                Client4.getPostsAfter(channelId, postId, 0, perPage, fetchThreads, collapsedThreadsEnabled, collapsedThreadsExtended),
                Client4.getPostThread(postId, fetchThreads, collapsedThreadsEnabled, collapsedThreadsExtended),
                Client4.getPostsBefore(channelId, postId, 0, perPage, fetchThreads, collapsedThreadsEnabled, collapsedThreadsExtended),
            ]);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        // Dispatch a combined post list so that the order is correct for postsInChannel
        const posts: PostList = {
            posts: {
                ...after.posts,
                ...thread.posts,
                ...before.posts,
            },
            order: [ // Remember that the order is newest posts first
                ...after.order,
                postId,
                ...before.order,
            ],
            next_post_id: after.next_post_id,
            prev_post_id: before.prev_post_id,
        };

        getProfilesAndStatusesForPosts(posts.posts, dispatch, getState);

        dispatch(batchActions([
            receivedPosts(posts),
            receivedPostsInChannel(posts, channelId, after.next_post_id === '', before.prev_post_id === ''),
        ]));

        return {data: posts};
    };
}

// getThreadsForPosts is intended for an array of posts that have been batched
// (see the actions/websocket_actions/handleNewPostEvents function in the webapp)
export function getThreadsForPosts(posts: Post[], fetchThreads = true) {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        if (!Array.isArray(posts) || !posts.length) {
            return {data: true};
        }

        const state = getState();
        const promises: Array<Promise<ActionResult>> = [];

        posts.forEach((post) => {
            if (!post.root_id) {
                return;
            }

            const rootPost = Selectors.getPost(state, post.root_id);
            if (!rootPost) {
                promises.push(dispatch(getPostThread(post.root_id, fetchThreads)));
            }
        });

        return Promise.all(promises);
    };
}

// Note that getProfilesAndStatusesForPosts can take either an array of posts or a map of ids to posts
export function getProfilesAndStatusesForPosts(postsArrayOrMap: Post[]|Map<string, Post>, dispatch: DispatchFunc, getState: GetStateFunc) {
    if (!postsArrayOrMap) {
        // Some API methods return {error} for no results
        return Promise.resolve();
    }

    const posts = Object.values(postsArrayOrMap);

    if (posts.length === 0) {
        return Promise.resolve();
    }

    const state = getState();
    const {currentUserId, profiles, statuses} = state.entities.users;

    // Statuses and profiles of the users who made the posts
    const userIdsToLoad = new Set<string>();
    const statusesToLoad = new Set<string>();

    Object.values(posts).forEach((post) => {
        const userId = post.user_id;

        if (!statuses[userId]) {
            statusesToLoad.add(userId);
        }

        if (userId === currentUserId) {
            return;
        }

        if (!profiles[userId]) {
            userIdsToLoad.add(userId);
        }
    });

    const promises: any[] = [];
    if (userIdsToLoad.size > 0) {
        promises.push(getProfilesByIds(Array.from(userIdsToLoad))(dispatch, getState));
    }

    if (statusesToLoad.size > 0) {
        promises.push(getStatusesByIds(Array.from(statusesToLoad))(dispatch, getState));
    }

    // Profiles of users mentioned in the posts
    const usernamesToLoad = getNeededAtMentionedUsernames(state, posts);

    if (usernamesToLoad.size > 0) {
        promises.push(getProfilesByUsernames(Array.from(usernamesToLoad))(dispatch, getState));
    }

    return Promise.all(promises);
}

export function getNeededAtMentionedUsernames(state: GlobalState, posts: Post[]): Set<string> {
    let usersByUsername: Dictionary<UserProfile>; // Populate this lazily since it's relatively expensive

    const usernamesToLoad = new Set<string>();

    posts.forEach((post) => {
        if (!post.message.includes('@')) {
            return;
        }

        if (!usersByUsername) {
            usersByUsername = getUsersByUsername(state);
        }

        const pattern = /\B@(([a-z0-9_.-]*[a-z0-9_])[.-]*)/gi;

        let match;
        while ((match = pattern.exec(post.message)) !== null) {
            // match[1] is the matched mention including trailing punctuation
            // match[2] is the matched mention without trailing punctuation
            if (General.SPECIAL_MENTIONS.indexOf(match[2]) !== -1) {
                continue;
            }

            if (usersByUsername[match[1]] || usersByUsername[match[2]]) {
                // We have the user, go to the next match
                continue;
            }

            // If there's no trailing punctuation, this will only add 1 item to the set
            usernamesToLoad.add(match[1]);
            usernamesToLoad.add(match[2]);
        }
    });

    return usernamesToLoad;
}

export type ExtendedPost = Post & { system_post_ids?: string[] };

export function removePost(post: ExtendedPost) {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        if (post.type === Posts.POST_TYPES.COMBINED_USER_ACTIVITY && post.system_post_ids) {
            const state = getState();

            for (const systemPostId of post.system_post_ids) {
                const systemPost = Selectors.getPost(state, systemPostId);

                if (systemPost) {
                    dispatch(removePost(systemPost as any) as any);
                }
            }
        } else {
            dispatch(postRemoved(post));
            if (post.is_pinned) {
                dispatch(
                    {
                        type: ChannelTypes.DECREMENT_PINNED_POST_COUNT,
                        id: post.channel_id,
                    },
                );
            }
        }
    };
}

export function selectPost(postId: string) {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: PostTypes.RECEIVED_POST_SELECTED,
            data: postId,
        });

        return {data: true};
    };
}

export function selectFocusedPostId(postId: string) {
    return {
        type: PostTypes.RECEIVED_FOCUSED_POST,
        data: postId,
    };
}

export function unflagPost(postId: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const {currentUserId} = getState().entities.users;
        const preference = {
            user_id: currentUserId,
            category: Preferences.CATEGORY_FLAGGED_POST,
            name: postId,
        };

        Client4.trackEvent('action', 'action_posts_unflag');

        return deletePreferences(currentUserId, [preference])(dispatch, getState);
    };
}

export function getOpenGraphMetadata(url: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let data;
        try {
            data = await Client4.getOpenGraphMetadata(url);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        if (data && (data.url || data.type || data.title || data.description)) {
            dispatch({
                type: PostTypes.RECEIVED_OPEN_GRAPH_METADATA,
                data,
                url,
            });
        }

        return {data};
    };
}

export function doPostAction(postId: string, actionId: string, selectedOption = '') {
    return doPostActionWithCookie(postId, actionId, '', selectedOption);
}

export function doPostActionWithCookie(postId: string, actionId: string, actionCookie: string, selectedOption = '') {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let data;
        try {
            data = await Client4.doPostActionWithCookie(postId, actionId, actionCookie, selectedOption);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        if (data && data.trigger_id) {
            dispatch({
                type: IntegrationTypes.RECEIVED_DIALOG_TRIGGER_ID,
                data: data.trigger_id,
            });
        }

        return {data};
    };
}

export function addMessageIntoHistory(message: string) {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: PostTypes.ADD_MESSAGE_INTO_HISTORY,
            data: message,
        });

        return {data: true};
    };
}

export function resetHistoryIndex(index: number) {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: PostTypes.RESET_HISTORY_INDEX,
            data: index,
        });

        return {data: true};
    };
}

export function moveHistoryIndexBack(index: number) {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: PostTypes.MOVE_HISTORY_INDEX_BACK,
            data: index,
        });

        return {data: true};
    };
}

export function moveHistoryIndexForward(index: number) {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: PostTypes.MOVE_HISTORY_INDEX_FORWARD,
            data: index,
        });

        return {data: true};
    };
}

/**
 * Ensures thread-replies in channels correctly follow CRT:ON/OFF
 */
export function resetReloadPostsInChannel() {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        dispatch({
            type: PostTypes.RESET_POSTS_IN_CHANNEL,
        });

        const currentChannelId = getCurrentChannelId(getState());
        if (currentChannelId) {
            // wait for channel to be fully deselected; prevent stuck loading screen
            // full state-change/reconciliation will cause prefetchChannelPosts to reload posts
            await dispatch(selectChannel('')); // do not remove await
            dispatch(selectChannel(currentChannelId));
        }
        return {data: true};
    };
}
