// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ServerError} from './errors';
import {UserProfile} from './users';
import {Dictionary, RelationOneToOne} from './utilities';

// TODO remove
export type TeamMembership = {
    mention_count: number;
    msg_count: number;
    mention_count_root: number;
    msg_count_root: number;
    team_id: string;
    user_id: string;
    roles: string;
    delete_at: number;
    scheme_user: boolean;
    scheme_admin: boolean;
};

// TODO remove
export type TeamMemberWithError = {
    member: TeamMembership;
    user_id: string;
    error: ServerError;
}

// TODO remove
export type TeamType = 'O' | 'I';

// TODO remove
export type Team = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    display_name: string;
    name: string;
    description: string;
    email: string;
    type: TeamType;
    company_name: string;
    allowed_domains: string;
    invite_id: string;
    allow_open_invite: boolean;
    scheme_id: string;
    group_constrained: boolean;
    policy_id?: string | null;
};

export type TeamsState = {
    currentTeamId: string;
    teams: Dictionary<Team>;
    myMembers: Dictionary<TeamMembership>;
    membersInTeam: RelationOneToOne<Team, RelationOneToOne<UserProfile, TeamMembership>>;
    stats: RelationOneToOne<Team, TeamStats>;
    groupsAssociatedToTeam: any;
    totalCount: number;
};

// TODO
export type TeamUnread = {
    team_id: string;
    mention_count: number;
    msg_count: number;
    mention_count_root: number;
    msg_count_root: number;
};

// TODO
export type GetTeamMembersOpts = {
    sort?: 'Username';
    exclude_deleted_users?: boolean;
};

// TODO
export type TeamsWithCount = {
    teams: Team[];
    total_count: number;
};

// TODO
export type TeamStats = {
    team_id: string;
    total_member_count: number;
    active_member_count: number;
};

// TODO remove
export type TeamSearchOpts = {
    page?: number;
    per_page?: number;
    allow_open_invite?: boolean;
    group_constrained?: boolean;
}

// TODO remove
export type TeamInviteWithError = {
    email: string;
    error: ServerError;
};
