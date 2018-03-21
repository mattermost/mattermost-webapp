// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeams} from 'mattermost-redux/actions/teams';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {withRouter} from 'react-router-dom';

import SelectTeam from './select_team.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    return {
        isLicensed: license.IsLicensed === 'true',
        customDescriptionText: config.CustomDescriptionText,
        enableTeamCreation: config.EnableTeamCreation === 'true',
        siteName: config.SiteName,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeams,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectTeam));
