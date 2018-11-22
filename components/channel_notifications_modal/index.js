// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {updateChannelNotifyProps} from 'mattermost-redux/actions/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getMyCurrentChannelMembership} from 'mattermost-redux/selectors/entities/channels';

import ChannelNotificationsModal from './channel_notifications_modal.jsx';

const mapStateToProps = createSelector(
    getMyCurrentChannelMembership,
    getConfig,
    (
        channelMember,
        config,
    ) => ({
        channelMember,
        sendPushNotifications: config.SendPushNotifications === 'true',
    }),
);

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        updateChannelNotifyProps,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChannelNotificationsModal);
