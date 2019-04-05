// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getBool as getBoolPreference} from 'mattermost-redux/selectors/entities/preferences';

import {getGlobalItem} from 'selectors/storage';
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
    }
);

export function isEmbedVisible(state, postId) {
    const previewCollapsed = getBoolPreference(
        state,
        Preferences.CATEGORY_DISPLAY_SETTINGS,
        Preferences.COLLAPSE_DISPLAY,
        Preferences.COLLAPSE_DISPLAY_DEFAULT !== 'false'
    );

    return getGlobalItem(state, StoragePrefixes.EMBED_VISIBLE + postId, !previewCollapsed);
}
