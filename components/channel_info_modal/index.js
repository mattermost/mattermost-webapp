// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentRelativeTeamUrl, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {getIsRhsOpen} from 'selectors/rhs';

import ChannelInfoModal from './channel_info_modal';

function mapStateToProps(state) {
    return {
        isRHSOpen: getIsRhsOpen(state),
        currentRelativeTeamUrl: getCurrentRelativeTeamUrl(state),
        currentChannel: getCurrentChannel(state),
        currentTeam: getCurrentTeam(state),
    };
}

export default connect(mapStateToProps)(ChannelInfoModal);
