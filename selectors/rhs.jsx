// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {createSelector} from 'reselect';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {makeGetGlobalItem} from 'selectors/storage';

import {PostTypes, Constants} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

export function getSelectedPostId(state) {
    return state.views.rhs.selectedPostId;
}

function getSelectedPostChannelId(state) {
    return state.views.rhs.selectedPostChannelId;
}

function getRealSelectedPost(state) {
    return state.entities.posts.posts[state.views.rhs.selectedPostId];
}

export const getSelectedPost = createSelector(
    getSelectedPostId,
    getRealSelectedPost,
    getSelectedPostChannelId,
    getCurrentUserId,
    (selectedPostId, selectedPost, selectedPostChannelId, currentUserId) => {
        if (selectedPost) {
            return selectedPost;
        }

        // If there is no root post found, assume it has been deleted by data retention policy, and create a fake one.
        return {
            id: selectedPostId,
            exists: false,
            type: PostTypes.FAKE_PARENT_DELETED,
            message: localizeMessage('rhs_thread.rootPostDeletedMessage.body', 'Part of this thread has been deleted due to a data retention policy. You can no longer reply to this thread.'),
            channel_id: selectedPostChannelId,
            user_id: currentUserId
        };
    }
);

export function makeGetCurrentUsersLatestPost(channelId, rootId) {
    return createSelector(
        getCurrentUserId,
        (state) => state.entities.posts.postsInChannel[channelId],
        (state) => (id) => getPost(state, id),
        (userId, postIds, getPostById) => {
            let lastPost = null;

            if (!postIds) {
                return lastPost;
            }

            for (const id of postIds) {
                const post = getPostById(id) || {};

                // don't edit webhook posts, deleted posts, or system messages
                if (post.user_id !== userId ||
                    (post.props && post.props.from_webhook) ||
                    post.state === Constants.POST_DELETED ||
                    (post.type && post.type.startsWith(Constants.SYSTEM_MESSAGE_PREFIX))) {
                    continue;
                }

                if (rootId) {
                    if (post.root_id === rootId || post.id === rootId) {
                        lastPost = post;
                        break;
                    }
                } else {
                    lastPost = post;
                    break;
                }
            }

            return lastPost;
        }
    );
}

export function makeGetCommentDraft(rootId) {
    const defaultValue = {message: '', fileInfos: [], uploadsInProgress: []};
    return makeGetGlobalItem(`comment_draft_${rootId}`, defaultValue);
}