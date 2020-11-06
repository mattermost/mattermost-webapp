// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SearchTypes} from 'mattermost-redux/action_types';
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
import {getSelectedPostId, getSelectedPostCardId, getRhsState} from 'selectors/rhs';
import {
    ActionTypes,
    Constants,
    RHSStates,
    StoragePrefixes,
} from 'utils/constants';
import {matchEmoticons} from 'utils/emoticons';
import * as UserAgent from 'utils/user_agent';

import {completePostReceive} from './new_post';

export function handleNewPost(post, msg) {
    return async (dispatch, getState) => {
        let websocketMessageProps = {};
        const state = getState();
        if (msg) {
            websocketMessageProps = msg.data;
        }

        const myChannelMember = getMyChannelMemberSelector(state, post.channel_id);
        const myChannelMemberDoesntExist = !myChannelMember || (Object.keys(myChannelMember).length === 0 && myChannelMember.constructor === 'Object');

        if (myChannelMemberDoesntExist) {
            await dispatch(getMyChannelMember(post.channel_id));
        }

        dispatch(completePostReceive(post, websocketMessageProps, myChannelMemberDoesntExist));

        if (msg && msg.data) {
            const currentUserId = getCurrentUserId(state);
            if (msg.data.channel_type === Constants.DM_CHANNEL) {
                dispatch(loadNewDMIfNeeded(post.channel_id, currentUserId));
            } else if (msg.data.channel_type === Constants.GM_CHANNEL) {
                dispatch(loadNewGMIfNeeded(post.channel_id));
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
        const emojis = matchEmoticons(post.message);
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

export function markPostAsUnread(post) {
    return async (dispatch, getState) => {
        const state = getState();
        const userId = getCurrentUserId(state);
        await dispatch(PostActions.setUnreadPost(userId, post.id));
    };
}

export function hideEditPostModal() {
    return {
        type: ActionTypes.HIDE_EDIT_POST_MODAL,
    };
}

export function deleteAndRemovePost(post) {
    return async (dispatch, getState) => {
        const {error} = await dispatch(PostActions.deletePost(post));
        if (error) {
            return {error};
        }

        if (post.id === getSelectedPostId(getState())) {
            dispatch({
                type: ActionTypes.SELECT_POST,
                postId: '',
                channelId: '',
                timestamp: 0,
            });
        }

        if (post.id === getSelectedPostCardId(getState())) {
            dispatch({
                type: ActionTypes.SELECT_POST_CARD,
                postId: '',
                channelId: '',
            });
        }

        dispatch(PostActions.removePost(post));

        return {data: true};
    };
}

export function toggleEmbedVisibility(postId) {
    return (dispatch, getState) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const visible = isEmbedVisible(state, postId);

        dispatch(StorageActions.setGlobalItem(StoragePrefixes.EMBED_VISIBLE + currentUserId + '_' + postId, !visible));
    };
}

export function resetEmbedVisibility() {
    return StorageActions.actionOnGlobalItemsWithPrefix(StoragePrefixes.EMBED_VISIBLE, () => null);
}

/**
 * It is called from either center or rhs text input when shortcut for react to last message is pressed
 *
 * @param {string} emittedFrom - It can be either "CENTER", "RHS_ROOT" or "NO_WHERE"
 */

export function emitShortcutReactToLastPostFrom(emittedFrom) {
    return {
        type: ActionTypes.EMITTED_SHORTCUT_REACT_TO_LAST_POST,
        payload: emittedFrom,
    };
}
