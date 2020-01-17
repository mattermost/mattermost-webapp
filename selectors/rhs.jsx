// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {makeGetGlobalItem} from 'selectors/storage';
import {PostTypes} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';

export function getSelectedPostId(state) {
    return state.views.rhs.selectedPostId;
}

export function getSelectedPostFocussedAt(state) {
    return state.views.rhs.selectedPostFocussedAt;
}

export function getSelectedPostCardId(state) {
    return state.views.rhs.selectedPostCardId;
}

export function getSelectedPostCard(state) {
    return state.entities.posts.posts[getSelectedPostCardId(state)];
}

export function getSelectedChannelId(state) {
    return state.views.rhs.selectedChannelId;
}

export function getPluginId(state) {
    return state.views.rhs.pluginId;
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
    return state.entities.search.isSearchingTerm;
}

export function getIsSearchingFlaggedPost(state) {
    return state.views.rhs.isSearchingFlaggedPost;
}

export function getIsSearchingPinnedPost(state) {
    return state.views.rhs.isSearchingPinnedPost;
}

export function getIsSearchGettingMore(state) {
    return state.entities.search.isSearchGettingMore;
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

export function getIsRhsOpen(state) {
    return state.views.rhs.isSidebarOpen;
}

export function getIsRhsMenuOpen(state) {
    return state.views.rhs.isMenuOpen;
}

export function getIsRhsExpanded(state) {
    return state.views.rhs.isSidebarExpanded;
}
