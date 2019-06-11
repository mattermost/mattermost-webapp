// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getBool as getBoolPreference} from 'mattermost-redux/selectors/entities/preferences';
import {memoizeResult} from 'mattermost-redux/utils/helpers';
import {isUserActivityPost} from 'mattermost-redux/utils/post_utils';
import * as PostListUtils from 'mattermost-redux/utils/post_list';

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

export function shouldShowJoinLeaveMessages(state) {
    return getBoolPreference(state, Preferences.CATEGORY_ADVANCED_SETTINGS, Preferences.ADVANCED_FILTER_JOIN_LEAVE, true);
}

export function makeCombineUserActivityFromPosts() {
    return memoizeResult(
        (posts) => {
            let lastPostIsUserActivity = false;
            let combinedCount = 0;

            const out = [];
            let changed = false;

            for (const post of posts) {
                const postIsUserActivity = isUserActivityPost(post.type);

                if (postIsUserActivity && lastPostIsUserActivity && combinedCount < PostListUtils.MAX_COMBINED_SYSTEM_POSTS) {
                    // Add the ID to the previous combined post
                    out[out.length - 1].id += '_' + post.id;

                    combinedCount += 1;

                    changed = true;
                } else if (postIsUserActivity) {
                    // Start a new combined post, even if the "combined" post is only a single post
                    const formattedPost = {
                        ...post,
                        id: PostListUtils.COMBINED_USER_ACTIVITY + post.id,
                    };

                    out.push(formattedPost);

                    combinedCount = 1;

                    changed = true;
                } else {
                    out.push(post);

                    combinedCount = 0;
                }

                lastPostIsUserActivity = postIsUserActivity;
            }

            if (!changed) {
                // Nothing was combined, so return the original array
                return posts;
            }

            return out;
        },
    );
}
