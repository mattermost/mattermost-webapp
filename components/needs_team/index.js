// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetchMyChannelsAndMembers, getMyChannelMembers, markChannelAsRead, viewChannel} from 'mattermost-redux/actions/channels';
import {getMyTeamUnreads} from 'mattermost-redux/actions/teams';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {withRouter} from 'react-router-dom';

import NeedsTeam from './needs_team.jsx';

function mapStateToProps(state) {
    return {
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            fetchMyChannelsAndMembers,
            getMyTeamUnreads,
            viewChannel,
            markChannelAsRead,
            getMyChannelMembers,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NeedsTeam));
