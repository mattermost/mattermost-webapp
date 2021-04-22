// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type ChannelCategoryType = 'favorites' | 'channels' | 'direct_messages' | 'custom';

export enum CategorySorting {
    Alphabetical = 'alpha',
    Default = '', // behaves the same as manual
    Recency = 'recent',
    Manual = 'manual',
}

export type ChannelCategory = {
    id: string;
    user_id: string;
    team_id: string;
    type: ChannelCategoryType;
    display_name: string;
    sorting: CategorySorting;
    channel_ids: string[];
    muted: boolean;
    collapsed: boolean;
};

export type OrderedChannelCategories = {
    categories: ChannelCategory[];
    order: string[];
};
