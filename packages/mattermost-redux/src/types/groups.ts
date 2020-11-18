// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from './users';

import {Dictionary, RelationOneToOne} from './utilities';

export type SyncableType = 'team' | 'channel';

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

export type GroupTeam = {
    team_id: string;
    team_display_name: string;
    team_type: string;
    group_id: string;
    auto_add: boolean;
    scheme_admin: boolean;
    create_at: number;
    delete_at: number;
    update_at: number;
};

export type GroupChannel = {
    channel_id: string;
    channel_display_name: string;
    channel_type: string;
    team_id: string;
    team_display_name: string;
    team_type: string;
    group_id: string;
    auto_add: boolean;
    scheme_admin: boolean;
    create_at: number;
    delete_at: number;
    update_at: number;
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

export type GroupSyncablesState = {
    teams: Array<GroupTeam>;
    channels: Array<GroupChannel>;
};

export type GroupsState = {
    syncables: Dictionary<GroupSyncablesState>;
    stats: RelationOneToOne<Group, GroupStats>;
    groups: Dictionary<Group>;
    myGroups: Dictionary<Group>;
};

export type GroupStats = {
    group_id: string;
    total_member_count: number;
};

export type GroupSearchOpts = {
    q: string;
    is_linked?: boolean;
    is_configured?: boolean;
};

export type MixedUnlinkedGroup = {
    mattermost_group_id?: string;
    name: string;
    primary_key: string;
    has_syncables?: boolean;
};

export type MixedUnlinkedGroupRedux = MixedUnlinkedGroup & {
    failed?: boolean;
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
