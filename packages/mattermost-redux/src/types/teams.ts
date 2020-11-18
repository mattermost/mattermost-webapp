// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ServerError} from './errors';
import {UserProfile} from './users';
import {Dictionary, RelationOneToOne} from './utilities';

export type TeamMembership = {
    mention_count: number;
    msg_count: number;
    team_id: string;
    user_id: string;
    roles: string;
    delete_at: number;
    scheme_user: boolean;
    scheme_admin: boolean;
};

export type TeamMemberWithError = {
    member: TeamMembership;
    user_id: string;
    error: ServerError;
}

export type TeamType = 'O' | 'I';

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

export type TeamUnread = {
    team_id: string;
    mention_count: number;
    msg_count: number;
};

export type GetTeamMembersOpts = {
    sort?: 'Username';
    exclude_deleted_users?: boolean;
};

export type TeamsWithCount = {
    teams: Team[];
    total_count: number;
};

export type TeamStats = {
    team_id: string;
    total_member_count: number;
    active_member_count: number;
};

export type TeamSearchOpts = {
    page?: number;
    per_page?: number;
    allow_open_invite?: boolean;
    group_constrained?: boolean;
}

export type TeamInviteWithError = {
    email: string;
    error: ServerError;
};
