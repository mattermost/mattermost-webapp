// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getCurrentUserId, makeGetProfilesInChannel, makeGetProfilesNotInChannel} from 'mattermost-redux/selectors/entities/users';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';

import {autocompleteUsersInChannel} from 'actions/views/channel';
import {autocompleteChannels} from 'actions/channel_actions';

import Textbox from './textbox.jsx';

const mapStateToProps = (state, ownProps) => {
    const getProfilesInChannel = makeGetProfilesInChannel();
    const getProfilesNotInChannel = makeGetProfilesNotInChannel();
    const permissions = {
        useChannelMentions: haveIChannelPermission(
            state,
            {
                channel: ownProps.channelId,
                permission: Permissions.USE_CHANNEL_MENTIONS,
            }
        ),
    };

    return {
        currentUserId: getCurrentUserId(state),
        profilesInChannel: getProfilesInChannel(state, ownProps.channelId, true),
        profilesNotInChannel: getProfilesNotInChannel(state, ownProps.channelId, true),
        permissions,
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        autocompleteUsersInChannel,
        autocompleteChannels,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(Textbox);
