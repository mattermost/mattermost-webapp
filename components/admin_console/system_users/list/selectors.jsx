// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {getUser, getProfiles, getProfilesInTeam, getProfilesWithoutTeam, searchProfiles, searchProfilesInTeam} from 'mattermost-redux/selectors/entities/users';

const ALL_USERS = '';
const NO_TEAM = 'no_team';
const USER_ID_LENGTH = 26;

export function getUsers(state, loading, teamId, term) {
    if (loading) {
        // Show no users while loading.
        return [];
    }

    if (term) {
        let users = [];
        if (teamId) {
            users = searchProfilesInTeam(state, teamId, term);
        } else {
            users = searchProfiles(state, term);
        }

        if (users.length === 0 && term.length === USER_ID_LENGTH) {
            const user = getUser(state, term);
            if (user) {
                users = [user];
            }
        }

        return users;
    }

    if (teamId === ALL_USERS) {
        return getProfiles(state);
    } else if (teamId === NO_TEAM) {
        return getProfilesWithoutTeam(state);
    }

    return getProfilesInTeam(state, teamId);
}
