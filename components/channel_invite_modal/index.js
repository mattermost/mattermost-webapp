// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getTeamStats} from 'mattermost-redux/actions/teams';
import {getProfilesNotInChannel, searchProfiles} from 'mattermost-redux/actions/users';
import {getProfilesNotInCurrentChannel} from 'mattermost-redux/selectors/entities/users';

// import {addUsersToChannel} from 'actions/channel_actions';
import {addChannelMember} from 'mattermost-redux/actions/channels';

import ChannelInviteModal from './channel_invite_modal.jsx';

function addUsersToChannel(channelId, userIds) {
    return async (dispatch) => {
        const requests = userIds.map((uId) => dispatch(addChannelMember(channelId, uId)));
        return Promise.all(requests);
    };
}

function mapStateToProps(state) {
    return {
        profilesNotInCurrentChannel: getProfilesNotInCurrentChannel(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addUsersToChannel,
            getProfilesNotInChannel,
            getTeamStats,
            searchProfiles,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelInviteModal);
