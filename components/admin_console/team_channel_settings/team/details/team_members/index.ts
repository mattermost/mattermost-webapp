// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {Dictionary} from 'mattermost-redux/types/utilities';
import {ServerError} from 'mattermost-redux/types/errors';
import {UserProfile, UsersStats, GetFilteredUsersStatsOpts} from 'mattermost-redux/types/users';
import {GenericAction, ActionFunc, ActionResult} from 'mattermost-redux/types/actions';

import {filterProfilesMatchingTerm, profileListToMap} from 'mattermost-redux/utils/user_utils';

import {getTeamStats as loadTeamStats} from 'mattermost-redux/actions/teams';
import {getFilteredUsersStats} from 'mattermost-redux/actions/users';

import {getMembersInTeams, getTeamStats, getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getProfilesInTeam, searchProfilesInTeam, filterProfiles, getFilteredUsersStats as selectFilteredUsersStats} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';
import {loadProfilesAndReloadTeamMembers, searchProfilesAndTeamMembers} from 'actions/user_actions.jsx';
import {setUserGridSearch, setUserGridFilters} from 'actions/views/search';

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
    loadProfilesAndReloadTeamMembers: (page: number, perPage: number, teamId?: string, options?: {[key: string]: any}) => Promise<{
        data: boolean;
    }>;
    searchProfilesAndTeamMembers: (term: string, options?: {[key: string]: any}) => Promise<{
        data: boolean;
    }>;
    getFilteredUsersStats: (filters: GetFilteredUsersStatsOpts) => Promise<{
        data?: UsersStats;
        error?: ServerError;
    }>;
    setUserGridSearch: (term: string) => ActionResult;
    setUserGridFilters: (filters: GetFilteredUsersStatsOpts) => ActionResult;
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
    const config = getConfig(state);
    const searchTerm = state.views.search.userGridSearch?.term || '';
    const filters = state.views.search.userGridSearch?.filters || {};

    let totalCount: number;
    if (Object.keys(filters).length === 0) {
        const stats = getTeamStats(state)[teamId] || {active_member_count: 0};
        totalCount = stats.active_member_count;
    } else {
        const filteredUserStats: UsersStats = selectFilteredUsersStats(state) || {
            total_users_count: 0,
        };
        totalCount = filteredUserStats.total_users_count;
    }

    let users = [];
    if (searchTerm) {
        users = searchProfilesInTeam(state, teamId, searchTerm, false, {active: true, ...filters});
        usersToAdd = searchUsersToAdd(usersToAdd, searchTerm);
    } else {
        users = getProfilesInTeam(state, teamId, {active: true, ...filters});
    }

    return {
        filters,
        teamId,
        team,
        users,
        teamMembers,
        usersToAdd,
        usersToRemove,
        totalCount,
        searchTerm,
        enableGuestAccounts: config.EnableGuestAccounts === 'true',
    };
}
function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            getTeamStats: loadTeamStats,
            loadProfilesAndReloadTeamMembers,
            searchProfilesAndTeamMembers,
            getFilteredUsersStats,
            setUserGridSearch,
            setUserGridFilters,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamMembers);
