// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel} from 'mattermost-redux/types/channels';

import Constants from 'utils/constants';

import SidebarBaseChannel from './sidebar_base_channel';
import SidebarDirectChannel from './sidebar_direct_channel';
import SidebarGroupChannel from './sidebar_group_channel';

type Props = {
    channel: Channel;
    teammateUsername?: string;
    currentTeamName: string;
};

type State = {

};

export default class SidebarChannel extends React.PureComponent<Props, State> {
    render() {
        const {channel, currentTeamName} = this.props;

        let ChannelComponent = SidebarBaseChannel;
        if (channel.type === Constants.DM_CHANNEL) {
            ChannelComponent = SidebarDirectChannel;
        } else if (channel.type === Constants.GM_CHANNEL) {
            ChannelComponent = SidebarGroupChannel;
        }

        return (
            <ChannelComponent
                channel={channel}
                currentTeamName={currentTeamName}
            />
        );
    }
}
