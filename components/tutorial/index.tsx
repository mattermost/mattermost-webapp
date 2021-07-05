// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {Permissions} from 'mattermost-redux/constants';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {haveICurrentTeamPermission} from 'mattermost-redux/selectors/entities/roles';

import Constants from 'utils/constants';
import {GlobalState} from 'types/store';

import TutorialView from './tutorial_view';

function mapStateToProps(state: GlobalState) {
    const license = getLicense(state);
    const config = getConfig(state);

    const teamChannels = getChannelsNameMapInCurrentTeam(state);
    const townSquare = teamChannels[Constants.DEFAULT_CHANNEL];
    const townSquareDisplayName = townSquare ? townSquare.display_name : Constants.DEFAULT_CHANNEL_UI_NAME;

    const appDownloadLink = config.AppDownloadLink;
    const isLicensed = license.IsLicensed === 'true';
    const restrictTeamInvite = !haveICurrentTeamPermission(state, Permissions.INVITE_USER);
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
