// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getTeamStats} from 'mattermost-redux/actions/teams';
import {getProfilesNotInChannel, searchProfiles} from 'mattermost-redux/actions/users';
import {getProfilesNotInCurrentChannel, getProfilesNotInCurrentTeam, getProfilesNotInTeam, getProfilesNotInChannel as selectProfilesNotInChannel} from 'mattermost-redux/selectors/entities/users';

import {addUsersToChannel} from 'actions/channel_actions';

import ChannelInviteModal from './channel_invite_modal.jsx';

function mapStateToProps(state, props) {
    let profilesNotInCurrentChannel;
    let profilesNotInCurrentTeam;
    if (props.useChannelId === true) {
        profilesNotInCurrentChannel = selectProfilesNotInChannel(state, props.channelId);
        profilesNotInCurrentTeam = getProfilesNotInTeam(state, props.teamId);
    } else {
        profilesNotInCurrentChannel = getProfilesNotInCurrentChannel(state);
        profilesNotInCurrentTeam = getProfilesNotInCurrentTeam(state);
    }

    return {
        profilesNotInCurrentChannel,
        profilesNotInCurrentTeam,
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
