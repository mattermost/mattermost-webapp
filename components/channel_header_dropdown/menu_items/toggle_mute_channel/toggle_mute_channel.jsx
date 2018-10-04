// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Constants, NotificationLevels} from 'utils/constants';

const ToggleMuteChannel = ({
    user,
    channel,
    isMuted,
    actions: {
        updateChannelNotifyProps,
    },
}) => {
    if (channel.type === Constants.DM_CHANNEL) {
        return null;
    }

    if (channel.type === Constants.GM_CHANNEL) {
        return null;
    }

    let notifyProps;
    let message;
    if (isMuted) {
        notifyProps = {mark_unread: NotificationLevels.ALL};
        message = (
            <FormattedMessage
                id='channel_header.unmute'
                defaultMessage='Unmute Channel'
            />
        );
    } else {
        notifyProps = {mark_unread: NotificationLevels.MENTION};
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
                className='style--none'
                role='menuitem'
                onClick={() => updateChannelNotifyProps(user.id, channel.id, notifyProps)}
            >
                {message}
            </button>
        </li>
    );
};

ToggleMuteChannel.propTypes = {

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

export default ToggleMuteChannel;
