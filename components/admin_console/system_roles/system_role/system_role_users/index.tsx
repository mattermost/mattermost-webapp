// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {Dictionary} from 'mattermost-redux/types/utilities';
import {ServerError} from 'mattermost-redux/types/errors';
import {UserProfile, UsersStats, GetFilteredUsersStatsOpts} from 'mattermost-redux/types/users';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {filterProfilesMatchingTerm, profileListToMap} from 'mattermost-redux/utils/user_utils';

import {getFilteredUsersStats, getProfiles, searchProfiles} from 'mattermost-redux/actions/users';

import {getRoles} from 'mattermost-redux/selectors/entities/roles_helpers';
import {getProfiles as selectProfiles, getFilteredUsersStats as selectFilteredUserStats, searchProfiles as selectProfilesWithTerm, filterProfiles, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {setUserGridSearch} from 'actions/views/search';
import {GlobalState} from 'types/store';

import SystemRoleUsers from './system_role_users';

type Props = {
    roleName: string;
    usersToAdd: Dictionary<UserProfile>;
    usersToRemove: Dictionary<UserProfile>;
}

type Actions = {
    getFilteredUsersStats: (filters: GetFilteredUsersStatsOpts) => Promise<{
        data?: UsersStats;
        error?: ServerError;
    }>;
    getProfiles: (page?: number | undefined, perPage?: number | undefined, options?: any) => Promise<any>;
    searchProfiles: (term: string, options: any) => Promise<any>;
    setUserGridSearch: (term: string) => Promise<any>;
}

function searchUsersToAdd(users: Dictionary<UserProfile>, term: string): Dictionary<UserProfile> {
    const profiles = filterProfilesMatchingTerm(Object.keys(users).map((key) => users[key]), term);
    const filteredProfilesMap = filterProfiles(profileListToMap(profiles), {});

    return filteredProfilesMap;
}

function mapStateToProps(state: GlobalState, props: Props) {
    const {roleName} = props;
    const role = getRoles(state)[roleName];
    const totalCount = selectFilteredUserStats(state)?.total_users_count || 0;
    const term = state.views.search.userGridSearch?.term || '';
    const filters = {roles: [role.name]};

    let users = [];
    let {usersToAdd} = props;
    if (term) {
        users = selectProfilesWithTerm(state, term, false, filters);
        usersToAdd = searchUsersToAdd(usersToAdd, term);
    } else {
        users = selectProfiles(state, filters);
    }

    return {
        role,
        users,
        totalCount,
        term,
        usersToAdd,
        currentUserId: getCurrentUserId(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            getProfiles,
            getFilteredUsersStats,
            searchProfiles,
            setUserGridSearch,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemRoleUsers);

