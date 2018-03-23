// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import CreateTeam from './create_team';

function mapStateToProps(state) {
    const config = getConfig(state);
    const license = getLicense(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeam = getCurrentTeam(state);

    const isLicensed = license.IsLicensed === 'true';
    const customDescriptionText = config.CustomDescriptionText;
    const siteName = config.SiteName;

    return {
        currentChannel,
        currentTeam,
        isLicensed,
        customDescriptionText,
        siteName,
    };
}

export default connect(mapStateToProps)(CreateTeam);
