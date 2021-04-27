// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getCurrentChannelId, makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {getAutoSortedCategoryIds, getDraggingState, isChannelSelected} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';
import {NotificationLevels} from 'utils/constants';

import {getMsgCountInChannel} from 'mattermost-redux/utils/channel_utils';

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
        const collapsed = isCollapsedThreadsEnabled(state);

        // Unread counts
        let unreadMentions = 0;
        let unreadMsgs = 0;
        let showUnreadForMsgs = true;
        if (member) {
            unreadMentions = collapsed ? member.mention_count_root : member.mention_count;

            if (channel) {
                unreadMsgs = getMsgCountInChannel(collapsed, channel, member);
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
            isChannelSelected: isChannelSelected(state, ownProps.channelId),
            multiSelectedChannelIds: state.views.channelSidebar.multiSelectedChannelIds,
            autoSortedCategoryIds: getAutoSortedCategoryIds(state),
        };
    };
}

export default connect(makeMapStateToProps)(SidebarChannel);
