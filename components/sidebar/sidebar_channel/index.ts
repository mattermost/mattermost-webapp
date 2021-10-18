// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannelId, makeGetChannel, makeGetChannelUnreadCount} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {getAutoSortedCategoryIds, getDraggingState, isChannelSelected} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';

import SidebarChannel from './sidebar_channel';

type OwnProps = {
    channelId: string;
}

function makeMapStateToProps() {
    const getChannel = makeGetChannel();
    const getUnreadCount = makeGetChannelUnreadCount();

    return (state: GlobalState, ownProps: OwnProps) => {
        const channel = getChannel(state, {id: ownProps.channelId});
        const currentTeam = getCurrentTeam(state);

        const currentChannelId = getCurrentChannelId(state);

        const unreadCount = getUnreadCount(state, channel.id);

        return {
            channel,
            isCurrentChannel: channel.id === currentChannelId,
            currentTeamName: currentTeam.name,
            unreadMentions: unreadCount.mentions,
            isUnread: unreadCount.showUnread,
            draggingState: getDraggingState(state),
            isChannelSelected: isChannelSelected(state, ownProps.channelId),
            multiSelectedChannelIds: state.views.channelSidebar.multiSelectedChannelIds,
            autoSortedCategoryIds: getAutoSortedCategoryIds(state),
        };
    };
}

export default connect(makeMapStateToProps)(SidebarChannel);
