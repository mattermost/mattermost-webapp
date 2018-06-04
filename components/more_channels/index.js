// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getChannels} from 'mattermost-redux/actions/channels';

import {getOtherChannels} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import MoreChannels from './more_channels.jsx';

function mapStateToProps(state) {
    const team = getCurrentTeam(state) || {};

    return {
        channels: getOtherChannels(state) || [],
        teamId: team.id,
        teamName: team.name,
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
