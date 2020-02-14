// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {getTeamStats, getTeamMembers} from 'mattermost-redux/actions/teams';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getMembersInCurrentTeam, getCurrentTeamStats} from 'mattermost-redux/selectors/entities/teams';
import {getProfilesInCurrentTeam, searchProfilesInCurrentTeam} from 'mattermost-redux/selectors/entities/users';
import {Permissions} from 'mattermost-redux/constants';
import {searchProfiles} from 'mattermost-redux/actions/users';
import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';

import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import {loadProfilesAndTeamMembers, loadTeamMembersForProfilesList} from 'actions/user_actions.jsx';
import {setModalSearchTerm} from 'actions/views/search';

import MemberListTeam from './member_list_team';

interface State extends GlobalState {
    views: {
        search: {
            modalSearch: string;
        };
    };
}

type Props = {
    teamId: string;
}

type Actions = {
    getTeamMembers: (teamId: string) => Promise<{data: {}}>;
    searchProfiles: (term: string, options?: {}) => Promise<{data: UserProfile[]}>;
    getTeamStats: (teamId: string) => Promise<{data: {}}>;
    loadProfilesAndTeamMembers: (page: number, perPage: number, teamId?: string, options?: {}) => Promise<{
        data: boolean;
    }>;
    loadStatusesForProfilesList: (users: Array<UserProfile>) => Promise<{
        data: boolean;
    }>;
    loadTeamMembersForProfilesList: (profiles: any, teamId: string) => Promise<{
        data: boolean;
    }>;
    setModalSearchTerm: (term: string) => Promise<{
        data: boolean;
    }>;
}

function mapStateToProps(state: State, ownProps: Props) {
    const canManageTeamMembers = haveITeamPermission(state, {team: ownProps.teamId, permission: Permissions.MANAGE_TEAM_ROLES});

    const searchTerm = state.views.search.modalSearch;

    let users;
    if (searchTerm) {
        users = searchProfilesInCurrentTeam(state, searchTerm);
    } else {
        users = getProfilesInCurrentTeam(state);
    }

    const stats = getCurrentTeamStats(state) || {active_member_count: 0};

    return {
        searchTerm,
        users,
        teamMembers: getMembersInCurrentTeam(state) || {},
        currentTeamId: state.entities.teams.currentTeamId,
        totalTeamMembers: stats.active_member_count,
        canManageTeamMembers,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            searchProfiles,
            getTeamStats,
            getTeamMembers,
            loadProfilesAndTeamMembers,
            loadStatusesForProfilesList,
            loadTeamMembersForProfilesList,
            setModalSearchTerm,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberListTeam);
