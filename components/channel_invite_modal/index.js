// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeamStats} from 'mattermost-redux/actions/teams';
import {getProfilesNotInChannel} from 'mattermost-redux/actions/users';

import ChannelInviteModal from './channel_invite_modal.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getProfilesNotInChannel,
            getTeamStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelInviteModal);
