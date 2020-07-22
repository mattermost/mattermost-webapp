// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getCurrentChannelId, makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {getDraggingState} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';
import {NotificationLevels} from 'utils/constants';

import SidebarChannel from './sidebar_channel';

type OwnProps = {
    channelId: string;
}

function makeMapStateToProps() {
    const getChannel = makeGetChannel();

    return (state: GlobalState, ownProps: OwnProps) => {
        const channel = getChannel(state, {id: ownProps.channelId});
        const currentTeam = getCurrentTeam(state);

        const member = getMyChannelMemberships(state)[ownProps.channelId];
        const currentChannelId = getCurrentChannelId(state);

        // Unread counts
        let unreadMentions = 0;
        let unreadMsgs = 0;
        let showUnreadForMsgs = true;
        if (member) {
            unreadMentions = member.mention_count;

            if (channel) {
                unreadMsgs = Math.max(channel.total_msg_count - member.msg_count, 0);
            }

            if (member.notify_props) {
                showUnreadForMsgs = member.notify_props.mark_unread !== NotificationLevels.MENTION;
            }
        }

        return {
            channel,
            isCurrentChannel: channel.id === currentChannelId,
            currentTeamName: currentTeam.name,
            unreadMentions,
            unreadMsgs,
            showUnreadForMsgs,
            draggingState: getDraggingState(state),
        };
    };
}

export default connect(makeMapStateToProps)(SidebarChannel);
