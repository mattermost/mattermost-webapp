// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post, PostType} from '@mattermost/types/posts';
import {Channel} from '@mattermost/types/channels';
import {UserProfile} from '@mattermost/types/users';
import {FileInfo} from '@mattermost/types/files';

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
    channelId: string;
    createAt: number;
    updateAt: number;
    show?: boolean;
};

export type RhsViewState = {
    selectedPostId: Post['id'];
    selectedPostFocussedAt: number;
    selectedPostCardId: Post['id'];
    selectedChannelId: Channel['id'];
    highlightedPostId: Post['id'];
    previousRhsStates: RhsState[];
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
    editChannelMembers: boolean;
};

export type RhsState = 'mention' | 'search' | 'flag' | 'pin' | 'plugin' | 'channel-info' | 'channel-files' |'channel-members' | null;
