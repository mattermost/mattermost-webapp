// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getMyChannelMembers, viewChannel} from 'mattermost-redux/actions/channels';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import NeedsTeam from './needs_team.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        theme: getTheme(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            viewChannel,
            getMyChannelMembers
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NeedsTeam);
