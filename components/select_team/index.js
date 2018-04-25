// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';
import {createSelector} from 'reselect';

import {getTeams} from 'mattermost-redux/actions/teams';
import {loadRolesIfNeeded} from 'mattermost-redux/actions/roles';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getRoles} from 'mattermost-redux/selectors/entities/roles';
import {getJoinableTeams, getTeamMemberships} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import SelectTeam from './select_team.jsx';

const getSortedJoinableTeams = createSelector(
    getJoinableTeams,
    getCurrentUser,
    (joinableTeams, currentUser) => {
        function sortTeams(a, b) {
            const options = {
                numeric: true,
                sensitivity: 'base',
            };
            return a.display_name.localeCompare(b.display_name, currentUser.locale || 'en', options);
        }

        return Object.values(joinableTeams).
            filter((team) => team.delete_at === 0).
            sort(sortTeams);
    }
);

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);
    const currentUser = getCurrentUser(state);
    const myTeamMemberships = Object.values(getTeamMemberships(state));

    return {
        isLicensed: license.IsLicensed === 'true',
        currentUserRoles: currentUser.roles || '',
        customDescriptionText: config.CustomDescriptionText,
        roles: getRoles(state),
        enableTeamCreation: config.EnableTeamCreation === 'true',
        isMemberOfTeam: myTeamMemberships && myTeamMemberships.length > 0,
        joinableTeams: getSortedJoinableTeams(state),
        siteName: config.SiteName,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeams,
            loadRolesIfNeeded,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectTeam));
