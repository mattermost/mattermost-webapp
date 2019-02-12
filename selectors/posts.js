// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getBool as getBoolPreference} from 'mattermost-redux/selectors/entities/preferences';
import {shouldFilterJoinLeavePost} from 'mattermost-redux/utils/post_utils';
import {createIdsSelector} from 'mattermost-redux/utils/helpers';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';

import {getGlobalItem} from 'selectors/storage';
import {Preferences, StoragePrefixes, PostTypes, PostListSeparators} from 'utils/constants';

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

// Returns a selector that, given the state and an object containing an array of postIds and an optional
// timestamp of when the channel was last read, returns a memoized array of postIds interspersed with
// day indicators and an optional new message indicator.
export function makePreparePostIdsForPostList() {
    return createIdsSelector(
        (state, props) => props.posts,
        (state) => state.entities.posts.selectedPostId,
        (state, props) => props.lastViewedAt,
        (state, props) => props.indicateNewMessages,
        getCurrentUser,
        shouldShowJoinLeaveMessages,
        (posts, selectedPostId, lastViewedAt, indicateNewMessages, currentUser, showJoinLeave) => {
            if (!posts || posts.length === 0 || !currentUser) {
                return [];
            }

            const out = [];

            let lastDate = null;
            let addedNewMessagesIndicator = false;

            // Iterating through the posts from oldest to newest
            for (let i = posts.length - 1; i >= 0; i--) {
                const post = posts[i];

                if (
                    !post ||
                    (post.type === PostTypes.EPHEMERAL_ADD_TO_CHANNEL && !selectedPostId)
                ) {
                    continue;
                }

                // Filter out join/leave messages if necessary
                if (shouldFilterJoinLeavePost(post, showJoinLeave, currentUser.username)) {
                    continue;
                }

                // Push on a date header if the last post was on a different day than the current one
                const postDate = new Date(post.create_at);
                postDate.setHours(0, 0, 0, 0);

                if (!lastDate || lastDate.toDateString() !== postDate.toDateString()) {
                    out.unshift(PostListSeparators.DATE_LINE + postDate);

                    lastDate = postDate;
                }

                if (
                    lastViewedAt &&
                    post.create_at > lastViewedAt &&
                    post.user_id !== currentUser.id &&
                    !addedNewMessagesIndicator &&
                    indicateNewMessages
                ) {
                    // Added postId to solve ie11 rendering issue
                    out.unshift(PostListSeparators.START_OF_NEW_MESSAGES + post.id);
                    addedNewMessagesIndicator = true;
                }

                out.unshift(post.id);
            }

            return out;
        }
    );
}
