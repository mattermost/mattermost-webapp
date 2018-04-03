// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getUser, getProfiles, getProfilesInTeam, getProfilesWithoutTeam, searchProfiles, searchProfilesInTeam} from 'mattermost-redux/selectors/entities/users';

import SystemUsersList from './system_users_list.jsx';

const ALL_USERS = '';
const NO_TEAM = 'no_team';
const USER_ID_LENGTH = 26;

function mapStateToProps(state, ownProps) {
    const teamId = ownProps.teamId;
    const term = ownProps.term;

    let users = [];
    if (ownProps.loading) {
        // Clear the users while loading.
    } else if (term) {
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
    } else if (teamId === ALL_USERS) {
        users = getProfiles(state);
    } else if (teamId === NO_TEAM) {
        users = getProfilesWithoutTeam(state);
    } else {
        users = getProfilesInTeam(state, teamId);
    }

    return {
        users,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getUser,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUsersList);
