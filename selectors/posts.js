// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getBool as getBoolPreference} from 'mattermost-redux/selectors/entities/preferences';

import {getGlobalItem} from 'selectors/storage';
import {arePreviewsCollapsed} from 'selectors/preferences';
import {Preferences, StoragePrefixes} from 'utils/constants';

export const getEditingPost = createSelector(
    (state) => {
        if (state.views.posts.editingPost && state.views.posts.editingPost.postId) {
            return getPost(state, state.views.posts.editingPost.postId);
        }

        return null;
    },
    (state) => state.views.posts.editingPost,
    (post, editingPost) => {
        return {
            ...editingPost,
            post,
        };
    },
);

export function isEmbedVisible(state, postId) {
    const currentUserId = getCurrentUserId(state);
    const previewCollapsed = arePreviewsCollapsed(state);

    return getGlobalItem(state, StoragePrefixes.EMBED_VISIBLE + currentUserId + '_' + postId, !previewCollapsed);
}

export function isInlineImageVisible(state, postId, imageKey) {
    const currentUserId = getCurrentUserId(state);
    const imageCollapsed = arePreviewsCollapsed(state);

    return getGlobalItem(state, StoragePrefixes.INLINE_IMAGE_VISIBLE + currentUserId + '_' + postId + '_' + imageKey, !imageCollapsed);
}

export function shouldShowJoinLeaveMessages(state) {
    return getBoolPreference(state, Preferences.CATEGORY_ADVANCED_SETTINGS, Preferences.ADVANCED_FILTER_JOIN_LEAVE, true);
}
