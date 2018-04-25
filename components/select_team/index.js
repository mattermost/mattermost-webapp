// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {getTeams} from 'mattermost-redux/actions/teams';
import {loadRolesIfNeeded} from 'mattermost-redux/actions/roles';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getRoles} from 'mattermost-redux/selectors/entities/roles';

import SelectTeam from './select_team.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    return {
        isLicensed: license.IsLicensed === 'true',
        customDescriptionText: config.CustomDescriptionText,
        roles: getRoles(state),
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
