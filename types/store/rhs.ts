// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post} from 'mattermost-redux/types/posts';
import {Channel} from 'mattermost-redux/types/channels';
import {$ID} from 'mattermost-redux/types/utilities';

export type RhsViewState = {
    selectedPostId: $ID<Post>;
    selectedPostFocussedAt: number;
    selectedPostCardId: $ID<Post>;
    selectedChannelId: $ID<Channe>;
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
