// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Post} from 'mattermost-redux/types/posts';
import {IntlShape} from 'react-intl';

export type OwnProps = {
    [key: string]: any;
    isSideBarExpanded: boolean;
    isMentionSearch: boolean;
    isFlaggedPosts: boolean;
    isPinnedPosts: boolean;
    updateSearchTerms: (terms: string) => void;
    getMorePostsForSearch: () => void;
    shrink: () => void;
    isCard?: boolean;
    isOpened?: boolean;
    channelDisplayName?: string;
    children?: React.ReactNode;
}

export type StateProps = {
    results: Post[];
    matches: Record<string, string[]>;
    searchTerms: string;
    isSearchingTerm: boolean;
    isSearchingFlaggedPost: boolean;
    isSearchingPinnedPost: boolean;
    isSearchGettingMore: boolean;
    isSearchAtEnd: boolean;
    compactDisplay: boolean;
}

export type IntlProps = {
    intl: IntlShape;
}

export type Props = OwnProps & StateProps & IntlProps;

