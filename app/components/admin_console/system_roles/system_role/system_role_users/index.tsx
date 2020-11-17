// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {Dictionary} from 'mattermost-redux/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {filterProfilesStartingWithTerm, profileListToMap} from 'mattermost-redux/utils/user_utils';

import {getFilteredUsersStats, getProfiles, searchProfiles} from 'mattermost-redux/actions/users';

import {getRoles} from 'mattermost-redux/selectors/entities/roles_helpers';
import {getProfiles as selectProfiles, getFilteredUsersStats as selectFilteredUserStats, makeSearchProfilesStartingWithTerm, filterProfiles, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {setUserGridSearch} from 'actions/views/search';
import {GlobalState} from 'types/store';

import SystemRoleUsers, {Props} from './system_role_users';

type OwnProps = {
    roleName: string;
    usersToAdd: Dictionary<UserProfile>;
    usersToRemove: Dictionary<UserProfile>;
}

function searchUsersToAdd(users: Dictionary<UserProfile>, term: string): Dictionary<UserProfile> {
    const profiles = filterProfilesStartingWithTerm(Object.keys(users).map((key) => users[key]), term);
    const filteredProfilesMap = filterProfiles(profileListToMap(profiles), {});

    return filteredProfilesMap;
}

function mapStateToProps(state: GlobalState, props: OwnProps) {
    const {roleName} = props;
    const role = getRoles(state)[roleName];
    const totalCount = selectFilteredUserStats(state)?.total_users_count || 0;
    const term = state.views.search.userGridSearch?.term || '';
    const filters = {roles: [role.name]};
    const searchProfilesStartingWithTerm = makeSearchProfilesStartingWithTerm();

    let users = [];
    let {usersToAdd} = props;
    if (term) {
        users = searchProfilesStartingWithTerm(state, term, false, filters);
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
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Props['actions']>({
            getProfiles,
            getFilteredUsersStats,
            searchProfiles,
            setUserGridSearch,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemRoleUsers);

