// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// TODO@Michel: remove the import for `getIsInlinePostEditingEnabled` once the inline post editing feature is enabled by default
import {getIsInlinePostEditingEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {createSelector} from 'reselect';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {getGlobalItem} from 'selectors/storage';
import {arePreviewsCollapsed} from 'selectors/preferences';
import {StoragePrefixes} from 'utils/constants';

import type {GlobalState} from 'types/store';

export function getIsPostBeingEdited(state: GlobalState, postId: string) {
    // TODO@Michel: remove `getIsInlinePostEditingEnabled` once the inline post editing feature is enabled by default
    return getIsInlinePostEditingEnabled(state) && state.views.posts.editingPost.postId === postId && state.views.posts.editingPost.show;
}
export function getIsPostBeingEditedInRHS(state: GlobalState, postId: string) {
    const editingPost = getEditingPost(state);

    // TODO@Michel: remove `getIsInlinePostEditingEnabled` once the inline post editing feature is enabled by default
    return getIsInlinePostEditingEnabled(state) && editingPost.isRHS && editingPost.postId === postId && state.views.posts.editingPost.show;
}

export const getEditingPost = createSelector(
    'getEditingPost',
    (state: GlobalState) => state.views.posts.editingPost,
    (state: GlobalState) => getPost(state, state.views.posts.editingPost.postId),
    (editingPost, post) => {
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
