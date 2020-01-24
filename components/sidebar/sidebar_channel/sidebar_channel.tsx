// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';
import classNames from 'classnames';

import {Channel} from 'mattermost-redux/types/channels';

import Constants from 'utils/constants';
import ChannelMentionBadge from './channel_mention_badge';

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
};

type State = {

};

export default class SidebarChannel extends React.PureComponent<Props, State> {
    /**
     * Show as unread if you have unread mentions
     * OR if you have unread messages and the channel can be marked unread by preferences
     */
    showChannelAsUnread = () => {
        return this.props.unreadMentions > 0 || (this.props.unreadMsgs > 0 && this.props.showUnreadForMsgs);
    };

    /**
     * Create channel link from props
     */
    getChannelLink = () => {
        const {channel, teammateUsername, currentTeamName} = this.props;
        const channelStringified = String(channel.fake && JSON.stringify(channel));

        if (channel.fake) {
            return `/${currentTeamName}/channels/${channel.name}?fakechannel=${encodeURIComponent(channelStringified)}`;
        } else if (channel.type === Constants.DM_CHANNEL) {
            return `/${currentTeamName}/messages/@${teammateUsername}`;
        } else if (channel.type === Constants.GM_CHANNEL) {
            return `/${currentTeamName}/messages/${channel.name}`;
        } else {
            return `/${currentTeamName}/channels/${channel.name}`;
        }
    }

    render() {
        const {channel} = this.props;

        return (
            <div
                className={classNames('SidebarChannel', {
                    'unread-title': this.showChannelAsUnread(), // Bold if unread
                })}
            >
                <Link
                    to={this.getChannelLink()}
                >
                    {channel.display_name}
                </Link>
                <ChannelMentionBadge
                    channelId={channel.id}
                    unreadMentions={this.props.unreadMentions}
                />
            </div>
        );
    }
}
