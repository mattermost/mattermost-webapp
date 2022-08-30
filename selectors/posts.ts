// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'mattermost-redux/constants';

import {getGlobalItem} from 'selectors/storage';
import {arePreviewsCollapsed} from 'selectors/preferences';
import {StoragePrefixes} from 'utils/constants';

import type {GlobalState} from 'types/store';

export function getIsPostBeingEdited(state: GlobalState, postId: string) {
    return state.views.posts.editingPost.postId === postId && state.views.posts.editingPost.show;
}
export function getIsPostBeingEditedInRHS(state: GlobalState, postId: string) {
    const editingPost = getEditingPost(state);

    return editingPost.isRHS && editingPost.postId === postId && state.views.posts.editingPost.show;
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

export const showPostPriorityTooltip = createSelector(
    'showPostPriorityTooltip',
    (state: GlobalState) => get(state, Preferences.CATEGORY_POST_PRIORITY, Preferences.NAME_POST_PRIORITY_TUTORIAL_STATE, false),
    getCurrentUser,
    (tutorialState, user) => {
        if (tutorialState && JSON.parse(tutorialState)[Preferences.POST_PRIORITY_VIEWED]) {
            return false;
        }
        const createAt = new Date(user.create_at).getTime();
        const now = new Date().getTime();

        // user created less than a week ago
        if ((now - createAt) < 7 * 24 * 60 * 60 * 1000) {
            return false;
        }

        return true;
    },
);
