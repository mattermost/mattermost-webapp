// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type RhsViewState = {
    selectedPostId: string;
    selectedPostFocussedAt: number;
    selectedPostCardId: string;
    selectedChannelId: string;
    previousRhsState: RhsState;
    rhsState: RhsState;
    searchTerms: string;
    pluginId: string;
    searchResultsTerms: string;
    isSearchingFlaggedPosts: boolean;
    isSearchingPinnedPosts: boolean;
    isSidebarOpen: boolean;
    isSidebarExpanded: boolean;
    isMenuOpen: boolean;
};

export type RhsState = 'mention' | 'search' | 'flag' | 'pin' | 'plugin';
