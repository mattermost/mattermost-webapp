// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {RecentSearchParams} from '@mattermost/types/search';

export const formatRecentSearch = (searchParams: RecentSearchParams) => {
    const searchQueryItems = [];
    if (searchParams.terms) {
        searchQueryItems.push(searchParams.terms);
    }
    if (searchParams.excluded_terms) {
        searchQueryItems.push(`-${searchParams.excluded_terms}`);
    }
    if (searchParams.on_date) {
        searchQueryItems.push(`on:${searchParams.on_date}`);
    }
    if (searchParams.excluded_date) {
        searchQueryItems.push(`-on:${searchParams.excluded_date}`);
    }
    if (searchParams.from_users) {
        searchParams.from_users.forEach((userProfile) => {
            searchQueryItems.push(`from:${userProfile.username}`);
        });
    }
    if (searchParams.excluded_users) {
        searchParams.excluded_users.forEach((userProfile) => {
            searchQueryItems.push(`-from:${userProfile.username}`);
        });
    }
    if (searchParams.in_channels) {
        searchParams.in_channels.forEach((channel) => {
            searchQueryItems.push(`in:${channel.name}`);
        });
    }
    if (searchParams.excluded_channels) {
        searchParams.excluded_channels.forEach((channel) => {
            searchQueryItems.push(`-in:${channel.name}`);
        });
    }
    if (searchParams.before_date) {
        searchQueryItems.push(`before:${searchParams.before_date}`);
    }
    if (searchParams.excluded_before_date) {
        searchQueryItems.push(`-before:${searchParams.excluded_before_date}`);
    }
    if (searchParams.after_date) {
        searchQueryItems.push(`after:${searchParams.after_date}`);
    }
    if (searchParams.excluded_after_date) {
        searchQueryItems.push(`-after:${searchParams.excluded_after_date}`);
    }
    return searchQueryItems.join(' ');
};
