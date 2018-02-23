// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';

import ChannelIntroMessage from './channel_intro_message.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    return {
        isLicensed: license.IsLicensed === 'true',
        restrictPrivateChannelManageMembers: config.RestrictPrivateChannelManageMembers,
        restrictTeamInvite: config.RestrictTeamInvite,
    };
}

export default connect(mapStateToProps)(ChannelIntroMessage);
