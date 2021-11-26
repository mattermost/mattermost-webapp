// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {getGlobalItem} from 'selectors/storage';
import {arePreviewsCollapsed} from 'selectors/preferences';
import {StoragePrefixes} from 'utils/constants';

import type {GlobalState} from 'types/store';

export const getEditingPost = createSelector(
    'getEditingPost',
    (state: GlobalState) => {
        if (state.views.posts.editingPost && state.views.posts.editingPost.postId) {
            return getPost(state, state.views.posts.editingPost.postId);
        }

        return null;
    },
    (state: GlobalState) => state.views.posts.editingPost,
    (post, editingPost) => {
        return {
            ...editingPost,
            post,
        };
    },
);

export function isEmbedVisible(state: GlobalState, postId: string) {
    const currentUserId = getCurrentUserId(state);
    const previewCollapsed = arePreviewsCollapsed(state);

    return getGlobalItem(state, StoragePrefixes.EMBED_VISIBLE + currentUserId + '_' + postId, !previewCollapsed);
}

export function isInlineImageVisible(state: GlobalState, postId: string, imageKey: string) {
    const currentUserId = getCurrentUserId(state);
    const imageCollapsed = arePreviewsCollapsed(state);

    return getGlobalItem(state, StoragePrefixes.INLINE_IMAGE_VISIBLE + currentUserId + '_' + postId + '_' + imageKey, !imageCollapsed);
}
