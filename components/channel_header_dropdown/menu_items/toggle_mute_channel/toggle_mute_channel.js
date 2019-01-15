// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Constants, NotificationLevels} from 'utils/constants';

export default class ToggleMuteChannel extends React.PureComponent {
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
        if (this.props.channel.type === Constants.DM_CHANNEL) {
            return null;
        }

        let message;
        if (this.props.isMuted) {
            message = (
                <FormattedMessage
                    id='channel_header.unmute'
                    defaultMessage='Unmute Channel'
                />
            );
        } else {
            message = (
                <FormattedMessage
                    id='channel_header.mute'
                    defaultMessage='Mute Channel'
                />
            );
        }

        return (
            <li role='presentation'>
                <button
                    id='channelMute'
                    className='style--none'
                    role='menuitem'
                    onClick={this.handleClick}
                >
                    {message}
                </button>
            </li>
        );
    }
}
