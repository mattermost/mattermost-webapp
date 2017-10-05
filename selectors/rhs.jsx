// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {PostTypes} from 'utils/constants.jsx';
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
