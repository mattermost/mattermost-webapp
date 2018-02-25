// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannels} from 'mattermost-redux/actions/channels';
import {isCurrentUserCurrentTeamAdmin} from 'mattermost-redux/selectors/entities/teams';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {showCreateOption} from 'utils/channel_utils.jsx';
import {Constants} from 'utils/constants.jsx';

import MoreChannels from './more_channels.jsx';

function mapStateToProps(state) {
    const isSystemAdmin = isCurrentUserSystemAdmin(state);
    const isTeamAdmin = isCurrentUserCurrentTeamAdmin(state);
    const showCreatePublicChannelOption = showCreateOption(state, Constants.OPEN_CHANNEL, isTeamAdmin, isSystemAdmin);

    return {
        showCreatePublicChannelOption,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannels,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoreChannels);
