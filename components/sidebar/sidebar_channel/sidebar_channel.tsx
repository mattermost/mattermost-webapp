// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel} from 'mattermost-redux/types/channels';

import Constants from 'utils/constants';

import ChannelMentionBadge from './channel_mention_badge';
import SidebarBaseChannel from './sidebar_base_channel';
import SidebarDirectChannel from './sidebar_direct_channel';
import SidebarGroupChannel from './sidebar_group_channel';

type Props = {

    /**
     * The channel object for this channel list item
     */
    channel: Channel;

    /**
     * If in a DM, the name of the user your DM is with
     */
    teammateUsername?: string;

    /**
     * The current team you are on
     */
    currentTeamName: string;

    /**
     * Number of unread mentions in this channel
     */
    unreadMentions: number;

    /**
     * Number of unread messages in this channel
     */
    unreadMsgs: number;

    /**
     * User preference of whether the channel can be marked unread
     */
    showUnreadForMsgs: boolean;

    /**
     * Sets the ref for the sidebar channel div element, so that it can be used by parent components
     */
    setChannelRef: (channelId: string, ref: HTMLDivElement) => void;

    /**
     * If category is collapsed
     */
    isCollapsed: boolean;

    /**
     * Is the channel the currently focused channel
     */
    isCurrentChannel: boolean;
};

type State = {
    isUnread: boolean;
    isCollapsed: boolean;
};

export default class SidebarChannel extends React.PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = SidebarChannel.getDerivedStateFromProps(props);
    }

    static getDerivedStateFromProps(nextProps: Props) {
        return {
            isUnread: SidebarChannel.isUnread(nextProps),
            isCollapsed: SidebarChannel.isCollapsed(nextProps),
        }
    }

    /**
     * Show as unread if you have unread mentions
     * OR if you have unread messages and the channel can be marked unread by preferences
     */
    static isUnread = (props: Props) => {
        return props.unreadMentions > 0 || (props.unreadMsgs > 0 && props.showUnreadForMsgs);
    };

    static isCollapsed = (props: Props) => {
        return props.isCollapsed && !SidebarChannel.isUnread(props) && !props.isCurrentChannel;
    }

    setRef = (ref: HTMLDivElement) => {
        this.props.setChannelRef(this.props.channel.id, ref);
    }

    render() {
        const {channel, currentTeamName} = this.props;
        const {isUnread, isCollapsed} = this.state;

        let ChannelComponent = SidebarBaseChannel;
        if (channel.type === Constants.DM_CHANNEL) {
            ChannelComponent = SidebarDirectChannel;
        } else if (channel.type === Constants.GM_CHANNEL) {
            ChannelComponent = SidebarGroupChannel;
        }

        return (
            <div
                ref={this.setRef}
                style={{
                    display: isCollapsed ? 'none' : 'flex',
                    fontWeight: isUnread ? 'bold' : 'inherit', // TODO temp styling
                }}
            >
                <ChannelComponent
                    channel={channel}
                    currentTeamName={currentTeamName}
                />
                <ChannelMentionBadge
                    channelId={channel.id}
                    unreadMentions={this.props.unreadMentions}
                />
            </div>
        );
    }
}
