// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {Permissions} from 'mattermost-redux/constants';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import Constants from 'utils/constants';

import TutorialView from './tutorial_view.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    const team = getCurrentTeam(state);

    const teamChannels = getChannelsNameMapInCurrentTeam(state);
    const townSquare = teamChannels[Constants.DEFAULT_CHANNEL];
    const townSquareDisplayName = townSquare ? townSquare.display_name : Constants.DEFAULT_CHANNEL_UI_NAME;

    const appDownloadLink = config.AppDownloadLink;
    const isLicensed = license.IsLicensed === 'true';
    const restrictTeamInvite = !haveITeamPermission(state, {team: team.id, permission: Permissions.INVITE_USER});
    const supportEmail = config.SupportEmail;

    return {
        townSquareDisplayName,
        appDownloadLink,
        isLicensed,
        restrictTeamInvite,
        supportEmail,
    };
}

export default connect(mapStateToProps)(TutorialView);
