// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {PostTypes, SearchTypes} from 'mattermost-redux/action_types';
import {getMyChannelMember} from 'mattermost-redux/actions/channels';
import {getMyChannelMember as getMyChannelMemberSelector} from 'mattermost-redux/selectors/entities/channels';
import * as PostActions from 'mattermost-redux/actions/posts';
import * as PostSelectors from 'mattermost-redux/selectors/entities/posts';
import {comparePosts} from 'mattermost-redux/utils/post_utils';

import {addRecentEmoji} from 'actions/emoji_actions';
import * as StorageActions from 'actions/storage';
import {loadNewDMIfNeeded, loadNewGMIfNeeded} from 'actions/user_actions.jsx';
import * as RhsActions from 'actions/views/rhs';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import store from 'stores/redux_store.jsx';
import {isEmbedVisible} from 'selectors/posts';
import {getSelectedPostId, getRhsState} from 'selectors/rhs';
import {
    ActionTypes,
    Constants,
    RHSStates,
    StoragePrefixes,
} from 'utils/constants';
import {EMOJI_PATTERN} from 'utils/emoticons.jsx';
import * as UserAgent from 'utils/user_agent';

import {completePostReceive} from './post_utils';

const dispatch = store.dispatch;
const getState = store.getState;

export function handleNewPost(post, msg) {
    return async (doDispatch, doGetState) => {
        let websocketMessageProps = {};
        if (msg) {
            websocketMessageProps = msg.data;
        }

        const myChannelMember = getMyChannelMemberSelector(doGetState(), post.channel_id);
        if (myChannelMember && Object.keys(myChannelMember).length === 0 && myChannelMember.constructor === 'Object') {
            await doDispatch(getMyChannelMember(post.channel_id));
        }

        doDispatch(completePostReceive(post, websocketMessageProps));

        if (msg && msg.data) {
            if (msg.data.channel_type === Constants.DM_CHANNEL) {
                loadNewDMIfNeeded(post.channel_id);
            } else if (msg.data.channel_type === Constants.GM_CHANNEL) {
                loadNewGMIfNeeded(post.channel_id);
            }
        }
    };
}

const getPostsForIds = PostSelectors.makeGetPostsForIds();

export function flagPost(postId) {
    return async (doDispatch, doGetState) => {
        await doDispatch(PostActions.flagPost(postId));
        const state = doGetState();
        const rhsState = getRhsState(state);

        if (rhsState === RHSStates.FLAG) {
            const results = state.entities.search.results;
            const index = results.indexOf(postId);
            if (index === -1) {
                const flaggedPost = PostSelectors.getPost(state, postId);
                const posts = getPostsForIds(state, results).reduce((acc, post) => {
                    acc[post.id] = post;
                    return acc;
                }, {});
                posts[flaggedPost.id] = flaggedPost;

                const newResults = [...results, postId];
                newResults.sort((a, b) => comparePosts(posts[a], posts[b]));

                doDispatch({
                    type: SearchTypes.RECEIVED_SEARCH_POSTS,
                    data: {posts, order: newResults},
                });
            }
        }

        return {data: true};
    };
}

export function unflagPost(postId) {
    return async (doDispatch, doGetState) => {
        await doDispatch(PostActions.unflagPost(postId));
        const state = doGetState();
        const rhsState = getRhsState(state);

        if (rhsState === RHSStates.FLAG) {
            let results = state.entities.search.results;
            const index = results.indexOf(postId);
            if (index > -1) {
                results = [...results];
                results.splice(index, 1);

                const posts = getPostsForIds(state, results);

                doDispatch({
                    type: SearchTypes.RECEIVED_SEARCH_POSTS,
                    data: {posts, order: results},
                });
            }
        }

        return {data: true};
    };
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
        dispatch(storeCommentDraft(post.root_id, null));
    } else {
        dispatch(storeDraft(post.channel_id, null));
    }

    if (success) {
        success();
    }
}

export function storeDraft(channelId, draft) {
    return (doDispatch) => {
        doDispatch(StorageActions.setGlobalItem('draft_' + channelId, draft));
    };
}

export function storeCommentDraft(rootPostId, draft) {
    return (doDispatch) => {
        doDispatch(StorageActions.setGlobalItem('comment_draft_' + rootPostId, draft));
    };
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
    dispatch(addRecentEmoji(emoji));
}

const POST_INCREASE_AMOUNT = Constants.POST_CHUNK_SIZE / 2;

// Returns true if there are more posts to load
export function increasePostVisibility(channelId, focusedPostId) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();
        if (state.views.channel.loadingPosts[channelId]) {
            return true;
        }

        const currentPostVisibility = state.views.channel.postVisibility[channelId];

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
            result = await doDispatch(PostActions.getPostsBefore(channelId, focusedPostId, page, POST_INCREASE_AMOUNT));
        } else {
            result = await doDispatch(PostActions.getPosts(channelId, page, POST_INCREASE_AMOUNT));
        }
        const posts = result.data;

        doDispatch({
            type: ActionTypes.LOADING_POSTS,
            data: false,
            channelId,
        });

        return posts ? posts.order.length >= POST_INCREASE_AMOUNT : false;
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

export function setEditingPost(postId = '', commentCount = 0, refocusId = '', title = '', isRHS = false) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();
        const post = PostSelectors.getPost(state, postId);

        if (!post || post.pending_post_id === postId) {
            return {data: false};
        }

        let canEditNow = true;

        // Only show the modal if we can edit the post now, but allow it to be hidden at any time
        if (postId && state.entities.general.license.IsLicensed === 'true') {
            const config = state.entities.general.config;

            if (config.AllowEditPost === Constants.ALLOW_EDIT_POST_NEVER) {
                canEditNow = false;
            } else if (config.AllowEditPost === Constants.ALLOW_EDIT_POST_TIME_LIMIT) {
                if ((post.create_at + (config.PostEditTimeLimit * 1000)) < Date.now()) {
                    canEditNow = false;
                }
            }
        }

        if (canEditNow) {
            doDispatch({
                type: ActionTypes.SHOW_EDIT_POST_MODAL,
                data: {postId, commentCount, refocusId, title, isRHS},
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

export function toggleEmbedVisibility(postId) {
    return (doDispatch, doGetState) => {
        const visible = isEmbedVisible(doGetState(), postId);

        doDispatch(StorageActions.setGlobalItem(StoragePrefixes.EMBED_VISIBLE + postId, !visible));
    };
}

export function resetEmbedVisibility() {
    return StorageActions.actionOnGlobalItemsWithPrefix(StoragePrefixes.EMBED_VISIBLE, () => null);
}
