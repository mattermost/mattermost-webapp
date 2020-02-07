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
     * Sets the ref for the sidebar channel div element, so that it can be used by parent components
     */
    setChannelRef: (channelId: string, ref: HTMLDivElement) => void;
};

type State = {

};

export default class SidebarChannel extends React.PureComponent<Props, State> {
    setRef = (ref: HTMLDivElement) => {
        this.props.setChannelRef(this.props.channel.id, ref);
    }

    render() {
        const {channel, currentTeamName} = this.props;

        let ChannelComponent: React.ComponentType<{channel: Channel; currentTeamName: string}> = SidebarBaseChannel;
        if (channel.type === Constants.DM_CHANNEL) {
            ChannelComponent = SidebarDirectChannel;
        } else if (channel.type === Constants.GM_CHANNEL) {
            ChannelComponent = SidebarGroupChannel;
        }

        return (
            <div ref={this.setRef}>
                <ChannelComponent
                    channel={channel}
                    currentTeamName={currentTeamName}
                />
            </div>
        );
    }
}
