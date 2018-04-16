// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeams, getTeamStats} from 'mattermost-redux/actions/teams';
import {getUser, getUserAccessToken} from 'mattermost-redux/actions/users';
import {getTeamsList} from 'mattermost-redux/selectors/entities/teams';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import SystemUsers from './system_users.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    const siteName = config.SiteName;
    const mfaEnabled = (license && license.IsLicensed === 'true' && license.MFA === 'true') &&
        config.EnableMultifactorAuthentication === 'true';
    const enableUserAccessTokens = config.EnableUserAccessTokens === 'true';
    const experimentalEnableAuthenticationTransfer = config.ExperimentalEnableAuthenticationTransfer === 'true';

    return {
        teams: getTeamsList(state),
        siteName,
        mfaEnabled,
        enableUserAccessTokens,
        experimentalEnableAuthenticationTransfer,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeams,
            getTeamStats,
            getUser,
            getUserAccessToken,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUsers);
