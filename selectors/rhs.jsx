// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {createSelector} from 'reselect';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';

import {makeGetGlobalItem, getItemFromStorage} from 'selectors/storage';
import {PostTypes, StoragePrefixes, Preferences} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

export function getSelectedPostId(state) {
    return state.views.rhs.selectedPostId;
}

export function getSelectedChannelId(state) {
    return state.views.rhs.selectedChannelId;
}

function getRealSelectedPost(state) {
    return state.entities.posts.posts[getSelectedPostId(state)];
}

export const getSelectedPost = createSelector(
    getSelectedPostId,
    getRealSelectedPost,
    getSelectedChannelId,
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
            user_id: currentUserId,
        };
    }
);

export function getRhsState(state) {
    return state.views.rhs.rhsState;
}

export function getPreviousRhsState(state) {
    return state.views.rhs.previousRhsState;
}

export function getSearchTerms(state) {
    return state.views.rhs.searchTerms;
}

export function getSearchResultsTerms(state) {
    return state.views.rhs.searchResultsTerms;
}

export function getIsSearchingTerm(state) {
    return state.views.rhs.isSearchingTerm;
}

export function getIsSearchingFlaggedPost(state) {
    return state.views.rhs.isSearchingFlaggedPost;
}

export function getIsSearchingPinnedPost(state) {
    return state.views.rhs.isSearchingPinnedPost;
}

export function getPostDraft(state, prefixId, suffixId) {
    const defaultDraft = {message: '', fileInfos: [], uploadsInProgress: []};
    const draft = makeGetGlobalItem(prefixId + suffixId, defaultDraft)(state);

    if (
        typeof draft.message !== 'undefined' &&
        typeof draft.uploadsInProgress !== 'undefined' &&
        typeof draft.fileInfos !== 'undefined'
    ) {
        return draft;
    }

    return defaultDraft;
}

export function makeGetPostsEmbedVisibleObj() {
    return createSelector(
        (state) => state.storage.storage,
        (state) => getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.COLLAPSE_DISPLAY, Preferences.COLLAPSE_DISPLAY_DEFAULT),
        (state, posts) => posts,
        (storage, previewCollapsed, posts) => {
            const postsEmbedVisibleObj = {};
            for (const post of posts) {
                postsEmbedVisibleObj[post.id] = getItemFromStorage(storage, StoragePrefixes.EMBED_VISIBLE + post.id, !previewCollapsed);
            }

            return postsEmbedVisibleObj;
        }
    );
}

export function getIsRhsOpen(state) {
    return state.views.rhs.isSidebarOpen;
}

export function getIsRhsMenuOpen(state) {
    return state.views.rhs.isMenuOpen;
}
