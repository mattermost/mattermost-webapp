// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {PostTypes, SearchTypes} from 'mattermost-redux/action_types';
import {getMyChannelMember} from 'mattermost-redux/actions/channels';
import {getChannel, getMyChannelMember as getMyChannelMemberSelector} from 'mattermost-redux/selectors/entities/channels';
import * as PostActions from 'mattermost-redux/actions/posts';
import * as PostSelectors from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {canEditPost, comparePosts} from 'mattermost-redux/utils/post_utils';

import {addRecentEmoji} from 'actions/emoji_actions';
import * as StorageActions from 'actions/storage';
import {loadNewDMIfNeeded, loadNewGMIfNeeded} from 'actions/user_actions.jsx';
import * as RhsActions from 'actions/views/rhs';
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

export function handleNewPost(post, msg) {
    return async (dispatch, getState) => {
        let websocketMessageProps = {};
        if (msg) {
            websocketMessageProps = msg.data;
        }

        const myChannelMember = getMyChannelMemberSelector(getState(), post.channel_id);
        if (myChannelMember && Object.keys(myChannelMember).length === 0 && myChannelMember.constructor === 'Object') {
            await dispatch(getMyChannelMember(post.channel_id));
        }

        dispatch(completePostReceive(post, websocketMessageProps));

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
    return async (dispatch, getState) => {
        await dispatch(PostActions.flagPost(postId));
        const state = getState();
        const rhsState = getRhsState(state);

        if (rhsState === RHSStates.FLAG) {
            addPostToSearchResults(postId, state, dispatch);
        }

        return {data: true};
    };
}

export function unflagPost(postId) {
    return async (dispatch, getState) => {
        await dispatch(PostActions.unflagPost(postId));
        const state = getState();
        const rhsState = getRhsState(state);

        if (rhsState === RHSStates.FLAG) {
            removePostFromSearchResults(postId, state, dispatch);
        }

        return {data: true};
    };
}

export function createPost(post, files) {
    return async (dispatch) => {
        // parse message and emit emoji event
        const emojis = post.message.match(EMOJI_PATTERN);
        if (emojis) {
            for (const emoji of emojis) {
                const trimmed = emoji.substring(1, emoji.length - 1);
                dispatch(addRecentEmoji(trimmed));
            }
        }

        let result;
        if (UserAgent.isIosClassic()) {
            result = await dispatch(PostActions.createPostImmediately(post, files));
        } else {
            result = await dispatch(PostActions.createPost(post, files));
        }

        if (post.root_id) {
            dispatch(storeCommentDraft(post.root_id, null));
        } else {
            dispatch(storeDraft(post.channel_id, null));
        }

        return result;
    };
}

export function storeDraft(channelId, draft) {
    return (dispatch) => {
        dispatch(StorageActions.setGlobalItem('draft_' + channelId, draft));
    };
}

export function storeCommentDraft(rootPostId, draft) {
    return (dispatch) => {
        dispatch(StorageActions.setGlobalItem('comment_draft_' + rootPostId, draft));
    };
}

export function addReaction(postId, emojiName) {
    return (dispatch) => {
        dispatch(PostActions.addReaction(postId, emojiName));
        dispatch(addRecentEmoji(emojiName));
    };
}

const POST_INCREASE_AMOUNT = Constants.POST_CHUNK_SIZE / 2;

// Returns true if there are more posts to load
export function increasePostVisibility(channelId, focusedPostId) {
    return async (dispatch, getState) => {
        const state = getState();
        if (state.views.channel.loadingPosts[channelId]) {
            return true;
        }

        const currentPostVisibility = state.views.channel.postVisibility[channelId];

        if (currentPostVisibility >= Constants.MAX_POST_VISIBILITY) {
            return true;
        }

        dispatch({
            type: ActionTypes.LOADING_POSTS,
            data: true,
            channelId,
        });

        const page = Math.floor(currentPostVisibility / POST_INCREASE_AMOUNT);

        let result;
        if (focusedPostId) {
            result = await dispatch(PostActions.getPostsBefore(channelId, focusedPostId, page, POST_INCREASE_AMOUNT));
        } else {
            result = await dispatch(PostActions.getPosts(channelId, page, POST_INCREASE_AMOUNT));
        }
        const posts = result.data;

        const actions = [{
            type: ActionTypes.LOADING_POSTS,
            data: false,
            channelId,
        }];

        if (posts) {
            actions.push({
                type: ActionTypes.INCREASE_POST_VISIBILITY,
                data: channelId,
                amount: posts.order.length,
            });
        }

        dispatch(batchActions(actions));
        return {
            moreToLoad: posts ? posts.order.length >= POST_INCREASE_AMOUNT : false,
            error: result.error,
        };
    };
}

export function searchForTerm(term) {
    return (dispatch) => {
        dispatch(RhsActions.updateSearchTerms(term));
        dispatch(RhsActions.showSearchResults());
    };
}

function addPostToSearchResults(postId, state, dispatch) {
    const results = state.entities.search.results;
    const index = results.indexOf(postId);
    if (index === -1) {
        const newPost = PostSelectors.getPost(state, postId);
        const posts = getPostsForIds(state, results).reduce((acc, post) => {
            acc[post.id] = post;
            return acc;
        }, {});
        posts[newPost.id] = newPost;

        const newResults = [...results, postId];
        newResults.sort((a, b) => comparePosts(posts[a], posts[b]));

        dispatch({
            type: SearchTypes.RECEIVED_SEARCH_POSTS,
            data: {posts, order: newResults},
        });
    }
}

function removePostFromSearchResults(postId, state, dispatch) {
    let results = state.entities.search.results;
    const index = results.indexOf(postId);
    if (index > -1) {
        results = [...results];
        results.splice(index, 1);

        const posts = getPostsForIds(state, results);

        dispatch({
            type: SearchTypes.RECEIVED_SEARCH_POSTS,
            data: {posts, order: results},
        });
    }
}

export function pinPost(postId) {
    return async (dispatch, getState) => {
        await dispatch(PostActions.pinPost(postId));
        const state = getState();
        const rhsState = getRhsState(state);

        if (rhsState === RHSStates.PIN) {
            addPostToSearchResults(postId, state, dispatch);
        }
    };
}

export function unpinPost(postId) {
    return async (dispatch, getState) => {
        await dispatch(PostActions.unpinPost(postId));
        const state = getState();
        const rhsState = getRhsState(state);

        if (rhsState === RHSStates.PIN) {
            removePostFromSearchResults(postId, state, dispatch);
        }
    };
}

export function setEditingPost(postId = '', commentCount = 0, refocusId = '', title = '', isRHS = false) {
    return async (dispatch, getState) => {
        const state = getState();
        const post = PostSelectors.getPost(state, postId);

        if (!post || post.pending_post_id === postId) {
            return {data: false};
        }

        const config = state.entities.general.config;
        const license = state.entities.general.license;
        const userId = getCurrentUserId(state);
        const channel = getChannel(state, post.channel_id);
        const teamId = channel.team_id || '';

        const canEditNow = canEditPost(state, config, license, teamId, post.channel_id, userId, post);

        // Only show the modal if we can edit the post now, but allow it to be hidden at any time

        if (canEditNow) {
            dispatch({
                type: ActionTypes.SHOW_EDIT_POST_MODAL,
                data: {postId, commentCount, refocusId, title, isRHS},
            });
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
    return async (dispatch, getState) => {
        const {currentUserId} = getState().entities.users;

        let hardDelete = false;
        if (post.user_id === currentUserId) {
            hardDelete = true;
        }

        const {error} = await dispatch(PostActions.deletePost(post, hardDelete));
        if (error) {
            return {error};
        }

        if (post.id === getSelectedPostId(getState())) {
            dispatch({
                type: ActionTypes.SELECT_POST,
                postId: '',
                channelId: '',
            });
        }

        dispatch({
            type: PostTypes.REMOVE_POST,
            data: post,
        });

        return {data: true};
    };
}

export function toggleEmbedVisibility(postId) {
    return (dispatch, getState) => {
        const visible = isEmbedVisible(getState(), postId);

        dispatch(StorageActions.setGlobalItem(StoragePrefixes.EMBED_VISIBLE + postId, !visible));
    };
}

export function resetEmbedVisibility() {
    return StorageActions.actionOnGlobalItemsWithPrefix(StoragePrefixes.EMBED_VISIBLE, () => null);
}
