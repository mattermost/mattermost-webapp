// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getProfiles, getProfilesInTeam} from 'mattermost-redux/actions/users';
import {
    getCurrentUserId,
    getProfilesInCurrentChannel
} from 'mattermost-redux/selectors/entities/users';

import MoreDirectChannels from './more_direct_channels.jsx';

function mapStateToProps(state, ownProps) {
    let currentChannelMembers = [];
    if (ownProps.isExistingChannel) {
        currentChannelMembers = getProfilesInCurrentChannel(state);
    }

    const config = state.entities.general.config;
    const restrictDirectMessage = config.RestrictDirectMessage;

    return {
        ...ownProps,
        currentChannelMembers,
        currentUserId: getCurrentUserId(state),
        restrictDirectMessage
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getProfiles,
            getProfilesInTeam
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoreDirectChannels);
