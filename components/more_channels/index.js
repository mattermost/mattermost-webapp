// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getChannels} from 'mattermost-redux/actions/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {removeHiddenDefaultChannel} from 'actions/views/channel';

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
    const currentTeamId = getCurrentTeamId(state);
    const hiddenDefaultChannelId = state.views.channel.hiddenDefaultChannelId[currentTeamId] || '';

    return {
        currentTeamId,
        hiddenDefaultChannelId,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoreChannels);
