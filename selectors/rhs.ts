// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {Post, PostType} from 'mattermost-redux/types/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {Channel} from 'mattermost-redux/types/channels';
import {$ID} from 'mattermost-redux/types/utilities';

import {makeGetGlobalItem} from 'selectors/storage';
import {PostTypes} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';
import {GlobalState} from 'types/store';
import {RhsState, FakePost, PostDraft} from 'types/store/rhs';

export function getSelectedPostId(state: GlobalState): $ID<Post> {
    return state.views.rhs.selectedPostId;
}

export function getSelectedPostFocussedAt(state: GlobalState): number {
    return state.views.rhs.selectedPostFocussedAt;
}

export function getSelectedPostCardId(state: GlobalState): $ID<Post> {
    return state.views.rhs.selectedPostCardId;
}

export function getSelectedPostCard(state: GlobalState) {
    return state.entities.posts.posts[getSelectedPostCardId(state)];
}

export function getSelectedChannelId(state: GlobalState) {
    return state.views.rhs.selectedChannelId;
}

export const getSelectedChannel = (() => {
    const getChannel = makeGetChannel();

    return (state: GlobalState) => {
        const channelId = getSelectedChannelId(state);

        return getChannel(state, {id: channelId});
    };
})();

export function getPluggableId(state: GlobalState) {
    return state.views.rhs.pluggableId;
}

function getRealSelectedPost(state: GlobalState) {
    return state.entities.posts.posts[getSelectedPostId(state)];
}

export const getSelectedPost = createSelector(
    getSelectedPostId,
    getRealSelectedPost,
    getSelectedChannelId,
    getCurrentUserId,
    (selectedPostId: $ID<Post>, selectedPost: Post, selectedPostChannelId: $ID<Channel>, currentUserId): Post|FakePost => {
        if (selectedPost) {
            return selectedPost;
        }

        // If there is no root post found, assume it has been deleted by data retention policy, and create a fake one.
        return {
            id: selectedPostId,
            exists: false,
            type: PostTypes.FAKE_PARENT_DELETED as PostType,
            message: localizeMessage('rhs_thread.rootPostDeletedMessage.body', 'Part of this thread has been deleted due to a data retention policy. You can no longer reply to this thread.'),
            channel_id: selectedPostChannelId,
            user_id: currentUserId,
        };
    },
);

export function getRhsState(state: GlobalState): RhsState {
    return state.views.rhs.rhsState;
}

export function getPreviousRhsState(state: GlobalState): RhsState {
    return state.views.rhs.previousRhsState;
}

export function getSearchTerms(state: GlobalState): string {
    return state.views.rhs.searchTerms;
}

export function getSearchResultsTerms(state: GlobalState): string {
    return state.views.rhs.searchResultsTerms;
}

export function getIsSearchingTerm(state: GlobalState): boolean {
    return state.entities.search.isSearchingTerm;
}

export function getIsSearchingFlaggedPost(state: GlobalState): boolean {
    return state.views.rhs.isSearchingFlaggedPost;
}

export function getIsSearchingPinnedPost(state: GlobalState): boolean {
    return state.views.rhs.isSearchingPinnedPost;
}

export function getIsSearchGettingMore(state: GlobalState): boolean {
    return state.entities.search.isSearchGettingMore;
}

export function getPostDraft(state: GlobalState, prefixId: string, suffixId: string): PostDraft {
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

export function getIsRhsOpen(state: GlobalState): boolean {
    return state.views.rhs.isSidebarOpen;
}

export function getIsRhsMenuOpen(state: GlobalState): boolean {
    return state.views.rhs.isMenuOpen;
}

export function getIsRhsExpanded(state: GlobalState): boolean {
    return state.views.rhs.isSidebarExpanded;
}
