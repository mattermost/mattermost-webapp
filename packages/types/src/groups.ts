// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from './users';

export type SyncablePatch = {
    scheme_admin: boolean;
    auto_add: boolean;
};

export type GroupPatch = {
    allow_reference: boolean;
    name: string;
};

export type Group = {
    id: string;
    name: string;
    display_name: string;
    description: string;
    type: string;
    remote_id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    has_syncables: boolean;
    member_count: number;
    scheme_admin: boolean;
    allow_reference: boolean;
};

export type GroupSyncable = {
    group_id: string;

    auto_add: boolean;
    scheme_admin: boolean;
    create_at: number;
    delete_at: number;
    update_at: number;
    type: 'Team' | 'Channel';
};

export type MixedUnlinkedGroup = {
    mattermost_group_id?: string;
    name: string;
    primary_key: string;
    has_syncables?: boolean;
};

export type UserWithGroup = UserProfile & {
    groups: Group[];
    scheme_guest: boolean;
    scheme_user: boolean;
    scheme_admin: boolean;
};

export type GroupsWithCount = {
    groups: Group[];
    total_group_count: number;

    // These fields are added by the client after the groups are returned by the server
    channelID?: string;
    teamID?: string;
}

export type UsersWithGroupsAndCount = {
    users: UserWithGroup[];
    total_count: number;
};
