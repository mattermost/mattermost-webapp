// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Action} from 'redux';

import {ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';

import {SearchType} from 'types/store/rhs';

export type SearchFilterType = 'all' | 'documents' | 'spreadsheets' | 'presentations' | 'code' | 'images' | 'audio' | 'video';

export type OwnProps = {
    isSideBarRight?: boolean;
    isSideBarRightOpen?: boolean;
    isFocus: boolean;
    channelDisplayName?: string;
    getFocus?: (searchBarFocus: () => void) => void;
    children?: React.ReactNode;
}

export type StateProps = {
    isRhsExpanded: boolean;
    isRhsOpen: boolean;
    isSearchingTerm: boolean;
    searchTerms: string;
    searchType: SearchType;
    searchVisible: boolean;
    isMentionSearch: boolean;
    isFlaggedPosts: boolean;
    isPinnedPosts: boolean;
    isChannelFiles: boolean;
    currentChannelId: string;
}

export type DispatchProps = {
    actions: {
        updateSearchTerms: (term: string) => Action;
        updateSearchType: (searchType: string) => Action;
        showSearchResults: (isMentionSearch: boolean) => Record<string, any>;
        showChannelFiles: (channelId: string) => void;
        showMentions: () => void;
        showFlaggedPosts: () => void;
        setRhsExpanded: (expanded: boolean) => Action;
        closeRightHandSide: () => void;
        autocompleteChannelsForSearch: (term: string, success?: () => void, error?: () => void) => void;
        autocompleteUsersInTeam: (username: string) => DispatchFunc;
        updateRhsState: (rhsState: string) => void;
        getMorePostsForSearch: () => ActionFunc;
        getMoreFilesForSearch: () => ActionFunc;
        filterFilesSearchByExt: (extensions: string[]) => void;
    };
}

export type Props = StateProps & DispatchProps & OwnProps;
