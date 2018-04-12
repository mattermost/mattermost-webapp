// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetchMyChannelsAndMembers, markChannelAsRead, viewChannel} from 'mattermost-redux/actions/channels';
import {getMyTeamUnreads} from 'mattermost-redux/actions/teams';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {withRouter} from 'react-router-dom';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';

import {checkIfMFARequired} from 'utils/route';

import NeedsTeam from './needs_team.jsx';

function mapStateToProps(state, ownProps) {
    const license = getLicense(state);
    const config = getConfig(state);

    return {
        theme: getTheme(state),
        mfaRequired: checkIfMFARequired(license, config, ownProps.match.url),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            fetchMyChannelsAndMembers,
            getMyTeamUnreads,
            viewChannel,
            markChannelAsRead,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NeedsTeam));
