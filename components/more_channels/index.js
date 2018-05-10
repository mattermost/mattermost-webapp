// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getChannels, removeHiddenDefaultChannel} from 'mattermost-redux/actions/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {getHiddenChannelIdInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';

import MoreChannels from './more_channels.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannels,
            removeHiddenDefaultChannel,
        }, dispatch),
    };
}

function mapStateToProps(state) {
    return {
        currentTeamId: getCurrentTeamId(state),
        hiddenDefaultChannelId: getHiddenChannelIdInCurrentTeam(state),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoreChannels);
