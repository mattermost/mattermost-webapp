
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction} from 'mattermost-redux/types/actions';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {NotificationLevels} from 'utils/constants';

import SidebarChannel from './sidebar_channel';

type OwnProps = {
    channelId: string;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const getChannel = makeGetChannel();
    const channel = getChannel(state, {id: ownProps.channelId});
    const currentTeam = getCurrentTeam(state);
    const member = getMyChannelMemberships(state)[ownProps.channelId];

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
        currentTeamName: currentTeam.name,
        unreadMentions,
        unreadMsgs,
        showUnreadForMsgs,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarChannel);
