// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Channel} from './channels';
import {UserProfile} from './users';

export type Search = {
    terms: string;
    isOrSearch: boolean;
};

export type SearchState = {
    current: any;
    results: string[];
    fileResults: string[];
    flagged: string[];
    pinned: Record<string, string[]>;
    isSearchingTerm: boolean;
    isSearchGettingMore: boolean;
    isLimitedResults: number;
    recent: {
        [x: string]: Search[];
    };
    matches: {
        [x: string]: string[];
    };
    recentSearches: SearchParams[];
};

export type SearchParameter = {
    terms: string;
    is_or_search: boolean;
    time_zone_offset?: number;
    page: number;
    per_page: number;
    include_deleted_channels: boolean;
}

export type SearchParams = {
    after_date?: string;
    before_date?: string;
    excluded_after_date?: string;
    excluded_before_date?: string;
    excluded_channels: Channel[];
    excluded_date?: string;
    excluded_extensions?: string[];
    excluded_terms?: string;
    excluded_users: UserProfile[];
    extensions?: string[];
    from_users: UserProfile[];
    in_channels: Channel[];
    include_deleted_channels?: boolean;
    is_hashtag?: boolean;
    modifier: string;
    on_date?: string;
    or_terms?: boolean;
    search_without_user_id?: boolean;
    terms?: string; // done
    time_zone_offset?: number;
}
