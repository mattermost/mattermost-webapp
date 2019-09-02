// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {Constants, NotificationLevels} from 'utils/constants';

import {localizeMessage} from 'utils/utils';

import Menu from 'components/widgets/menu/menu';

export default class MenuItemToggleMuteChannel extends React.PureComponent {
    static propTypes = {

        /**
         * Object with info about the current user
         */
        user: PropTypes.object.isRequired,

        /**
         * Object with info about the current channel
         */
        channel: PropTypes.object.isRequired,

        /**
         * Boolean whether the current channel is muted
         */
        isMuted: PropTypes.bool.isRequired,

        /**
         * Use for test selector
         */
        id: PropTypes.string,

        /**
         * Object with action creators
         */
        actions: PropTypes.shape({
            updateChannelNotifyProps: PropTypes.func.isRequired,
        }).isRequired,
    };

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
            mark_unread: isMuted ? NotificationLevels.ALL : NotificationLevels.MENTION,
        });
    }

    render() {
        const {
            channel,
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
                show={channel.type !== Constants.DM_CHANNEL}
                onClick={this.handleClick}
                text={text}
            />
        );
    }
}
