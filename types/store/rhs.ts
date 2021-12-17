// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post, PostType} from 'mattermost-redux/types/posts';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';
import {FileInfo} from 'mattermost-redux/types/files';

export type SearchType = '' | 'files' | 'messages';

export type FakePost = {
    id: Post['id'];
    exists: boolean;
    type: PostType;
    message: string;
    channel_id: Channel['id'];
    user_id: UserProfile['id'];
};

export type PostDraft = {
    message: string;
    fileInfos: FileInfo[];
    uploadsInProgress: string[];
    props?: any;
    caretPosition?: number;
};

export type RhsViewState = {
    selectedPostId: Post['id'];
    selectedPostFocussedAt: number;
    selectedPostCardId: Post['id'];
    selectedChannelId: Channel['id'];
    highlightedPostId: Post['id'];
    previousRhsState: RhsState;
    filesSearchExtFilter: string[];
    rhsState: RhsState;
    searchTerms: string;
    searchType: SearchType;
    pluggableId: string;
    searchResultsTerms: string;
    isSearchingFlaggedPost: boolean;
    isSearchingPinnedPost: boolean;
    isSidebarOpen: boolean;
    isSidebarExpanded: boolean;
    isMenuOpen: boolean;
};

export type RhsState = 'mention' | 'search' | 'flag' | 'pin' | 'plugin' | null;
