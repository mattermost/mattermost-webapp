// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import {loadProfilesAndTeamMembers, loadTeamMembersForProfilesList} from 'actions/user_actions.jsx';
import {setModalFilters, setModalSearchTerm} from 'actions/views/search';
import {getTeamMembers, getTeamStats} from 'mattermost-redux/actions/teams';
import {searchProfiles} from 'mattermost-redux/actions/users';
import {Permissions} from 'mattermost-redux/constants';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeamStats, getMembersInCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {filterProfiles, getProfilesInCurrentTeam, searchProfilesInCurrentTeam} from 'mattermost-redux/selectors/entities/users';
import {ActionFunc, ActionResult, GenericAction} from 'mattermost-redux/types/actions';
import {GetTeamMembersOpts, TeamMembership, TeamStats} from 'mattermost-redux/types/teams';
import {UserProfile} from 'mattermost-redux/types/users';
import {profileListToMap, sortByUsername} from 'mattermost-redux/utils/user_utils';

import {GlobalState} from 'types/store';
import {SearchModalFilters} from 'types/store/views';

import MemberListTeam from './member_list_team';

type Props = {
    teamId: string;
}

type Actions = {
    getTeamMembers: (teamId: string, page?: number, perPage?: number, options?: GetTeamMembersOpts) => Promise<{data: TeamMembership}>;
    searchProfiles: (term: string, options?: {[key: string]: any}) => Promise<{data: UserProfile[]}>;
    getTeamStats: (teamId: string) => Promise<{data: TeamStats}>;
    loadProfilesAndTeamMembers: (page: number, perPage: number, teamId?: string, options?: {[key: string]: any}) => Promise<{
        data: boolean;
    }>;
    loadStatusesForProfilesList: (users: UserProfile[]) => Promise<{
        data: boolean;
    }>;
    loadTeamMembersForProfilesList: (profiles: any, teamId: string, reloadAllMembers: boolean) => Promise<{
        data: boolean;
    }>;
    setModalSearchTerm: (term: string) => ActionResult;
    setModalFilters: (filters: SearchModalFilters) => void;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const canManageTeamMembers = haveITeamPermission(state, ownProps.teamId, Permissions.MANAGE_TEAM_ROLES);

    const searchTerm = state.views.search.modalSearch;
    const filters = state.views.search.modalFilters;

    let users;
    if (searchTerm) {
        users = searchProfilesInCurrentTeam(state, searchTerm);
    } else {
        users = getProfilesInCurrentTeam(state);
    }

    const usersToDisplay = [];
    const actionUserProps: {
        [userId: string]: {
            teamMember: TeamMembership;
        };
    } = {};

    const teamMembers = getMembersInCurrentTeam(state) || {};
    const totalAdminsInTeam = Object.values(teamMembers).reduce((acc, k) => {
        return k.roles.includes('admin') ? acc + 1 : acc;
    }, 0);

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (teamMembers[user.id] && user.delete_at === 0) {
            usersToDisplay.push(user);
            actionUserProps[user.id] = {
                teamMember: teamMembers[user.id],
            };
        }
    }

    const filteredUsersToDisplayMap = filterProfiles(profileListToMap(usersToDisplay), filters);
    const filteredUsersToDisplay = Object.values(filteredUsersToDisplayMap).sort(sortByUsername);

    const stats = getCurrentTeamStats(state) || {active_member_count: 0};

    return {
        actionUserProps,
        searchTerm,
        users: filteredUsersToDisplay,
        teamMembers,
        currentTeamId: state.entities.teams.currentTeamId,
        totalTeamMembers: stats.active_member_count,
        totalAdminsInTeam,
        canManageTeamMembers,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            getTeamMembers,
            getTeamStats,
            loadProfilesAndTeamMembers,
            loadStatusesForProfilesList,
            loadTeamMembersForProfilesList,
            searchProfiles,
            setModalFilters,
            setModalSearchTerm,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberListTeam);
