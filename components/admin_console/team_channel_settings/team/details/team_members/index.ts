// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {Dictionary} from 'mattermost-redux/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {filterProfilesMatchingTerm, profileListToMap} from 'mattermost-redux/utils/user_utils';

import {getTeamStats as loadTeamStats} from 'mattermost-redux/actions/teams';

import {getMembersInTeams, getTeamStats, getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getProfilesInTeam, searchProfilesInTeam, filterProfiles} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';
import {loadProfilesAndReloadTeamMembers, searchProfilesAndTeamMembers} from 'actions/user_actions.jsx';
import {setModalSearchTerm} from 'actions/views/search';

import TeamMembers from './team_members';

type Props = {
    teamId: string;
    usersToAdd: Dictionary<UserProfile>;
    usersToRemove: Dictionary<UserProfile>;
};

type Actions = {
    getTeamStats: (teamId: string) => Promise<{
        data: boolean;
    }>;
    loadProfilesAndReloadTeamMembers: (page: number, perPage: number, teamId?: string, options?: {}) => Promise<{
        data: boolean;
    }>;
    searchProfilesAndTeamMembers: (term: string, options?: {}) => Promise<{
        data: boolean;
    }>;
    setModalSearchTerm: (term: string) => Promise<{
        data: boolean;
    }>;
};

function searchUsersToAdd(users: Dictionary<UserProfile>, term: string): Dictionary<UserProfile> {
    const profiles = filterProfilesMatchingTerm(Object.keys(users).map((key) => users[key]), term);
    const filteredProfilesMap = filterProfiles(profileListToMap(profiles), {});

    return filteredProfilesMap;
}

function mapStateToProps(state: GlobalState, props: Props) {
    const {teamId, usersToRemove} = props;
    let {usersToAdd} = props;

    const teamMembers = getMembersInTeams(state)[teamId] || {};
    const team = getTeam(state, teamId) || {};
    const stats = getTeamStats(state)[teamId] || {total_member_count: 0};

    const searchTerm = state.views.search.modalSearch;
    let users = [];
    if (searchTerm) {
        users = searchProfilesInTeam(state, teamId, searchTerm, false);
        usersToAdd = searchUsersToAdd(usersToAdd, searchTerm);
    } else {
        users = getProfilesInTeam(state, teamId);
    }

    return {
        teamId,
        team,
        users,
        teamMembers,
        usersToAdd,
        usersToRemove,
        totalCount: stats.total_member_count,
        searchTerm,
    };
}
function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getTeamStats: loadTeamStats,
            loadProfilesAndReloadTeamMembers,
            searchProfilesAndTeamMembers,
            setModalSearchTerm,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamMembers);
