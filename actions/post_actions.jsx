// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {batchActions} from 'redux-batched-actions';
import {PostTypes, SearchTypes} from 'mattermost-redux/action_types';
import {getMyChannelMember} from 'mattermost-redux/actions/channels';
import * as PostActions from 'mattermost-redux/actions/posts';
import * as Selectors from 'mattermost-redux/selectors/entities/posts';
import {comparePosts} from 'mattermost-redux/utils/post_utils';

import {sendDesktopNotification} from 'actions/notification_actions.jsx';
import {loadNewDMIfNeeded, loadNewGMIfNeeded} from 'actions/user_actions.jsx';
import * as RhsActions from 'actions/views/rhs';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import PostStore from 'stores/post_store.jsx';
import store from 'stores/redux_store.jsx';
import {getSelectedPostId, getRhsState} from 'selectors/rhs';
import {ActionTypes, Constants, RHSStates} from 'utils/constants.jsx';
import {EMOJI_PATTERN} from 'utils/emoticons.jsx';
import * as UserAgent from 'utils/user_agent';

const dispatch = store.dispatch;
const getState = store.getState;

export function handleNewPost(post, msg) {
    let websocketMessageProps = {};
    if (msg) {
        websocketMessageProps = msg.data;
    }

    if (ChannelStore.getMyMember(post.channel_id)) {
        completePostReceive(post, websocketMessageProps);
    } else {
        getMyChannelMember(post.channel_id)(dispatch, getState).then(() => completePostReceive(post, websocketMessageProps));
    }

    if (msg && msg.data) {
        if (msg.data.channel_type === Constants.DM_CHANNEL) {
            loadNewDMIfNeeded(post.channel_id);
        } else if (msg.data.channel_type === Constants.GM_CHANNEL) {
            loadNewGMIfNeeded(post.channel_id);
        }
    }
}

function completePostReceive(post, websocketMessageProps) {
    if (post.root_id && Selectors.getPost(getState(), post.root_id) == null) {
        PostActions.getPostThread(post.root_id)(dispatch, getState).then(
            (data) => {
                dispatchPostActions(post, websocketMessageProps);
                PostActions.getProfilesAndStatusesForPosts(data.posts, dispatch, getState);
            }
        );

        return;
    }

    dispatchPostActions(post, websocketMessageProps);
}

function dispatchPostActions(post, websocketMessageProps) {
    const {currentChannelId} = getState().entities.channels;

    if (post.channel_id === currentChannelId) {
        dispatch({
            type: ActionTypes.INCREASE_POST_VISIBILITY,
            data: post.channel_id,
            amount: 1,
        });
    }

    // Need manual dispatch to remove pending post
    dispatch({
        type: PostTypes.RECEIVED_POSTS,
        data: {
            order: [],
            posts: {
                [post.id]: post,
            },
        },
        channelId: post.channel_id,
    });

    // Still needed to update unreads
    AppDispatcher.handleServerAction({
        type: ActionTypes.RECEIVED_POST,
        post,
        websocketMessageProps,
    });

    sendDesktopNotification(post, websocketMessageProps);
}

export async function flagPost(postId) {
    await PostActions.flagPost(postId)(dispatch, getState);

    const rhsState = getRhsState(getState());

    // This is a hack that should be fixed with better reducers/actions, see MM-9793
    if (rhsState === RHSStates.FLAG) {
        let results = getState().entities.search.results;
        const index = results.indexOf(postId);
        if (index === -1) {
            results = [...results, postId];

            const posts = {};
            results.forEach((id) => {
                posts[id] = Selectors.getPost(getState(), id);
            });

            results.sort((a, b) => comparePosts(posts[a], posts[b]));

            dispatch({
                type: SearchTypes.RECEIVED_SEARCH_POSTS,
                data: {posts, order: results},
            });
        }
    }
}

export async function unflagPost(postId) {
    await PostActions.unflagPost(postId)(dispatch, getState);

    const rhsState = getRhsState(getState());

    // This is a hack that should be fixed with better reducers/actions, see MM-9793
    if (rhsState === RHSStates.FLAG) {
        let results = getState().entities.search.results;
        const index = results.indexOf(postId);
        if (index > -1) {
            results = [...results];
            results.splice(index, 1);

            const posts = {};
            results.forEach((id) => {
                posts[id] = Selectors.getPost(getState(), id);
            });

            dispatch({
                type: SearchTypes.RECEIVED_SEARCH_POSTS,
                data: {posts, order: results},
            });
        }
    }
}

export function addReaction(channelId, postId, emojiName) {
    PostActions.addReaction(postId, emojiName)(dispatch, getState);
}

export function removeReaction(channelId, postId, emojiName) {
    PostActions.removeReaction(postId, emojiName)(dispatch, getState);
}

export async function createPost(post, files, success) {
    // parse message and emit emoji event
    const emojis = post.message.match(EMOJI_PATTERN);
    if (emojis) {
        for (const emoji of emojis) {
            const trimmed = emoji.substring(1, emoji.length - 1);
            emitEmojiPosted(trimmed);
        }
    }

    if (UserAgent.isIosClassic()) {
        await PostActions.createPostImmediately(post, files)(dispatch, getState);
    } else {
        await PostActions.createPost(post, files)(dispatch, getState);
    }

    if (post.root_id) {
        PostStore.storeCommentDraft(post.root_id, null);
    } else {
        PostStore.storeDraft(post.channel_id, null);
    }

    if (success) {
        success();
    }
}

export async function updatePost(post, success) {
    const {data, error: err} = await PostActions.editPost(post)(dispatch, getState);
    if (data && success) {
        success();
    } else if (err) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVED_ERROR,
            err: {id: err.server_error_id, ...err},
            method: 'editPost',
        });
    }
}

export function emitEmojiPosted(emoji) {
    AppDispatcher.handleServerAction({
        type: ActionTypes.EMOJI_POSTED,
        alias: emoji,
    });
}

const POST_INCREASE_AMOUNT = Constants.POST_CHUNK_SIZE / 2;

// Returns true if there are more posts to load
export function increasePostVisibility(channelId, focusedPostId) {
    return async (doDispatch, doGetState) => {
        if (doGetState().views.channel.loadingPosts[channelId]) {
            return true;
        }

        const currentPostVisibility = doGetState().views.channel.postVisibility[channelId];

        if (currentPostVisibility >= Constants.MAX_POST_VISIBILITY) {
            return true;
        }

        doDispatch(batchActions([
            {
                type: ActionTypes.LOADING_POSTS,
                data: true,
                channelId,
            },
            {
                type: ActionTypes.INCREASE_POST_VISIBILITY,
                data: channelId,
                amount: POST_INCREASE_AMOUNT,
            },
        ]));

        const page = Math.floor(currentPostVisibility / POST_INCREASE_AMOUNT);

        let result;
        if (focusedPostId) {
            result = await PostActions.getPostsBefore(channelId, focusedPostId, page, POST_INCREASE_AMOUNT)(dispatch, getState);
        } else {
            result = await PostActions.getPosts(channelId, page, POST_INCREASE_AMOUNT)(doDispatch, doGetState);
        }
        const posts = result.data;

        doDispatch({
            type: ActionTypes.LOADING_POSTS,
            data: false,
            channelId,
        });

        return posts.order.length >= POST_INCREASE_AMOUNT;
    };
}

export function searchForTerm(term) {
    dispatch(RhsActions.updateSearchTerms(term));
    dispatch(RhsActions.showSearchResults());
}

export function pinPost(postId) {
    return async (doDispatch, doGetState) => {
        await PostActions.pinPost(postId)(doDispatch, doGetState);

        AppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVED_POST_PINNED,
            postId,
        });
    };
}

export function unpinPost(postId) {
    return async (doDispatch, doGetState) => {
        await PostActions.unpinPost(postId)(doDispatch, doGetState);

        AppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVED_POST_UNPINNED,
            postId,
        });
    };
}

export function doPostAction(postId, actionId) {
    PostActions.doPostAction(postId, actionId)(dispatch, getState);
}

export function setEditingPost(postId = '', commentsCount = 0, refocusId = '', title = '', isRHS = false) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();

        let canEditNow = true;

        // Only show the modal if we can edit the post now, but allow it to be hidden at any time
        if (postId && state.entities.general.license.IsLicensed === 'true') {
            const config = state.entities.general.config;

            if (config.AllowEditPost === Constants.ALLOW_EDIT_POST_NEVER) {
                canEditNow = false;
            } else if (config.AllowEditPost === Constants.ALLOW_EDIT_POST_TIME_LIMIT) {
                const post = Selectors.getPost(state, postId);

                if ((post.create_at + (config.PostEditTimeLimit * 1000)) < Date.now()) {
                    canEditNow = false;
                }
            }
        }

        if (canEditNow) {
            doDispatch({
                type: ActionTypes.SHOW_EDIT_POST_MODAL,
                data: {postId, commentsCount, refocusId, title, isRHS},
            }, doGetState);
        }

        return {data: canEditNow};
    };
}

export function hideEditPostModal() {
    return {
        type: ActionTypes.HIDE_EDIT_POST_MODAL,
    };
}

export function deleteAndRemovePost(post) {
    return async (doDispatch, doGetState) => {
        const {currentUserId} = doGetState().entities.users;

        let hardDelete = false;
        if (post.user_id === currentUserId) {
            hardDelete = true;
        }

        const {error} = await doDispatch(PostActions.deletePost(post, hardDelete));
        if (error) {
            return {error};
        }

        if (post.id === getSelectedPostId(doGetState())) {
            dispatch({
                type: ActionTypes.SELECT_POST,
                postId: '',
                channelId: '',
            });
        }

        doDispatch({
            type: PostTypes.REMOVE_POST,
            data: post,
        });

        // Needed for search store
        AppDispatcher.handleViewAction({
            type: Constants.ActionTypes.REMOVE_POST,
            post,
        });

        return {data: true};
    };
}
