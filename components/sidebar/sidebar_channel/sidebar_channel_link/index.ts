// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {Channel} from 'mattermost-redux/types/channels';
import {GenericAction} from 'mattermost-redux/types/actions';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import {clearChannelSelection, multiSelectChannelAdd, multiSelectChannelTo} from 'actions/views/channel_sidebar';
import {isChannelSelected} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';
import {NotificationLevels} from 'utils/constants';

import SidebarChannelLink from './sidebar_channel_link';

type OwnProps = {
    channel: Channel;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const member = getMyChannelMemberships(state)[ownProps.channel.id];

    // Unread counts
    let unreadMentions = 0;
    let unreadMsgs = 0;
    let showUnreadForMsgs = true;
    if (member) {
        unreadMentions = member.mention_count;

        if (ownProps.channel) {
            unreadMsgs = Math.max(ownProps.channel.total_msg_count - member.msg_count, 0);
        }

        if (member.notify_props) {
            showUnreadForMsgs = member.notify_props.mark_unread !== NotificationLevels.MENTION;
        }
    }

    return {
        unreadMentions,
        unreadMsgs,
        showUnreadForMsgs,
        isMuted: isChannelMuted(member),
        isChannelSelected: isChannelSelected(state, ownProps.channel.id),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            clearChannelSelection,
            multiSelectChannelTo,
            multiSelectChannelAdd,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarChannelLink);
