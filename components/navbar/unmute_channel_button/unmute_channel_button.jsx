// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {NotificationLevels} from 'utils/constants';

const UnmuteChannelButton = ({
    user: {
        id: userId,
    },
    channel: {
        id: channelId,
    },
    actions: {
        updateChannelNotifyProps,
    },
}) => (
    <button
        type='button'
        className='navbar-toggle icon icon__mute'
        onClick={() => updateChannelNotifyProps(userId, channelId, {mark_unread: NotificationLevels.ALL})}
    >
        <span className='fa fa-bell-slash-o icon'/>
    </button>
);

UnmuteChannelButton.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,

    channel: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,

    actions: PropTypes.shape({
        updateChannelNotifyProps: PropTypes.func.isRequired,
    }).isRequired,
};

export default UnmuteChannelButton;
