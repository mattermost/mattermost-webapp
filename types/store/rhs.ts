// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {RHSStates, ValueOf} from 'utils/constants';

export type RhsViewState = {
    selectedPostId: string;
    selectedPostFocussedAt: number;
    selectedPostCardId: string;
    selectedChannelId: string;
    previousRhsState: ValueOf<typeof RHSStates>;
    rhsState: ValueOf<typeof RHSStates>;
    searchTerms: string;
    pluginId: string;
    searchResultsTerms: string;
    isSearchingFlaggedPosts: boolean;
    isSearchingPinnedPosts: boolean;
    isSidebarOpen: boolean;
    isSidebarExpanded: boolean;
    isMenuOpen: boolean;
};
