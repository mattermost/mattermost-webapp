// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeamStats} from 'mattermost-redux/actions/teams';
import {getProfilesNotInChannel} from 'mattermost-redux/actions/users';
import {getProfilesNotInCurrentChannel} from 'mattermost-redux/selectors/entities/users';

import ChannelInviteModal from './channel_invite_modal.jsx';

function mapStateToProps(state) {
    return {
        profilesNotInCurrentChannel: getProfilesNotInCurrentChannel(state),
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
