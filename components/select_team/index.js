// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {getTeams} from 'mattermost-redux/actions/teams';
import {loadRolesIfNeeded} from 'mattermost-redux/actions/roles';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getRoles} from 'mattermost-redux/selectors/entities/roles';
import {getJoinableTeams, getTeamMemberships} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import SelectTeam from './select_team.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);
    const currentUser = getCurrentUser(state);
    const myTeamMemberships = Object.values(getTeamMemberships(state));

    function sortTeams(a, b) {
        const options = {
            numeric: true,
            sensitivity: 'base',
        };
        return a.display_name.localeCompare(b.display_name, currentUser.locale || 'en', options);
    }

    const joinableTeams = Object.values(getJoinableTeams(state)).
        filter((team) => team.delete_at === 0).
        sort(sortTeams);

    return {
        isLicensed: license.IsLicensed === 'true',
        currentUserRoles: currentUser.roles || '',
        customDescriptionText: config.CustomDescriptionText,
        roles: getRoles(state),
        enableTeamCreation: config.EnableTeamCreation === 'true',
        isMemberOfTeam: myTeamMemberships && myTeamMemberships.length > 0,
        joinableTeams,
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
