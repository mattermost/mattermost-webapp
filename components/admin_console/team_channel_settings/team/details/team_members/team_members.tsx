// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Dictionary} from 'mattermost-redux/types/utilities';

import {UserProfile} from 'mattermost-redux/types/users';
import {TeamMembership} from 'mattermost-redux/types/teams';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel';
import UserGrid from 'components/admin_console/user_grid/user_grid';
import {Role} from 'components/admin_console/user_grid/user_grid_role_dropdown';

type Props = {
    teamId: string;

    users: UserProfile[];
    teamMembers: Dictionary<TeamMembership>;

    removeUser: (user: UserProfile) => void;
    updateRole: (userId: string, schemeUser: boolean, schemeAdmin: boolean) => void;

    stats: {
        active_member_count: number;
        team_id: string;
        total_member_count: number;
    };

    actions: {
        getTeamStats: (teamId: string) => Promise<{
            data: boolean;
        }>;
        loadProfilesAndTeamMembers: (page: number, perPage: number, teamId?: string, options?: {}) => Promise<{
            data: boolean;
        }>;
    };
}

type State = {

}

const PROFILE_CHUNK_SIZE = 10;

export default class TeamMembers extends React.PureComponent<Props, State> {
    componentDidMount() {
        const {teamId} = this.props;
        const {loadProfilesAndTeamMembers, getTeamStats} = this.props.actions;
        Promise.all([
            getTeamStats(teamId),
            loadProfilesAndTeamMembers(0, PROFILE_CHUNK_SIZE * 2, teamId),
        ]);
    }

    loadPage = async (page: number) => {
        const {loadProfilesAndTeamMembers} = this.props.actions;
        const {teamId} = this.props;

        await loadProfilesAndTeamMembers(page + 1, PROFILE_CHUNK_SIZE, teamId);
    }

    removeUser = (user: UserProfile) => {
        this.props.removeUser(user);
    }

    updateMemberRolesForUser = (userId: string, role: Role) => {
        this.props.updateRole(userId, true, role.includes('admin'));
    }

    render = () => {
        return (
            <AdminPanel
                id='team_members'
                titleId={t('admin.team_settings.team_detail.membersTitle')}
                titleDefault='Members'
                subtitleId={t('admin.team_settings.team_detail.membersDescription')}
                subtitleDefault='The users in this list are members of this team'
            >
                <UserGrid
                    users={this.props.users}
                    loadPage={this.loadPage}
                    removeUser={this.removeUser}
                    totalCount={this.props.stats.total_member_count}
                    memberships={this.props.teamMembers}
                    updateMemberRolesForUser={this.updateMemberRolesForUser}
                />
            </AdminPanel>
        );
    }
}
