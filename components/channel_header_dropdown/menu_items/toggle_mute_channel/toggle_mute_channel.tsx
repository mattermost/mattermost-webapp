// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/src/types/users';
import {Channel} from 'mattermost-redux/src/types/channels';
import {ChannelNotifyProps} from 'mattermost-redux/types/channels';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {NotificationLevels} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import Menu from 'components/widgets/menu/menu';

export type Actions = {
    updateChannelNotifyProps(userId: string, channelId: string, props: Partial<ChannelNotifyProps>): ActionFunc;
};

type Props = {

    /**
     * Object with info about the current user
     */
    user: UserProfile;

    /**
     * Object with info about the current channel
     */
    channel: Channel;

    /**
     * Boolean whether the current channel is muted
     */
    isMuted: boolean;

    /**
     * Use for test selector
     */
    id?: string;

    /**
     * Object with action creators
     */
    actions: Actions;
};

export default class MenuItemToggleMuteChannel extends React.PureComponent<Props> {
    handleClick = () => {
        const {
            user,
            channel,
            isMuted,
            actions: {
                updateChannelNotifyProps,
            },
        } = this.props;

        updateChannelNotifyProps(user.id, channel.id, {
            mark_unread: (isMuted ? NotificationLevels.ALL : NotificationLevels.MENTION) as 'all' | 'mention',
        });
    }

    render() {
        const {
            id,
            isMuted,
        } = this.props;

        let text;
        if (isMuted) {
            text = localizeMessage('channel_header.unmute', 'Unmute Channel');
        } else {
            text = localizeMessage('channel_header.mute', 'Mute Channel');
        }

        return (
            <Menu.ItemAction
                id={id}
                onClick={this.handleClick}
                text={text}
            />
        );
    }
}
