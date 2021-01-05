// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Action} from 'redux';
import {ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';

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
    searchVisible: boolean;
    isMentionSearch: boolean;
    isFlaggedPosts: boolean;
    isPinnedPosts: boolean;
}

export type DispatchProps = {
    actions: {
        updateSearchTerms: (term: string) => Action;
        showSearchResults: (isMentionSearch: boolean) => Record<string, any>;
        showMentions: () => void;
        showFlaggedPosts: () => void;
        setRhsExpanded: (expanded: boolean) => Action;
        closeRightHandSide: () => void;
        autocompleteChannelsForSearch: (term: string, success?: () => void, error?: () => void) => void;
        autocompleteUsersInTeam: (username: string) => DispatchFunc;
        updateRhsState: (rhsState: string) => void;
        getMorePostsForSearch: () => ActionFunc;
    };
}

export type Props = StateProps & DispatchProps & OwnProps;
