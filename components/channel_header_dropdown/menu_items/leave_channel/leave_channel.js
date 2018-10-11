// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {showLeavePrivateChannelModal} from 'actions/global_actions';
import {Constants} from 'utils/constants';

export default class LeaveChannel extends React.PureComponent {
    static propTypes = {

        /**
         * Object with info about user
         */
        channel: PropTypes.object.isRequired,

        /**
         * Boolean whether the channel is default
         */
        isDefault: PropTypes.bool.isRequired,

        /**
         * Object with action creators
         */
        actions: PropTypes.shape({

            /**
             * Action creator to leave channel
             */
            leaveChannel: PropTypes.func.isRequired,
        }).isRequired,
    };

    handleLeave = (e) => {
        e.preventDefault();

        const {
            channel,
            actions: {
                leaveChannel,
            },
        } = this.props;

        if (channel.type === Constants.PRIVATE_CHANNEL) {
            showLeavePrivateChannelModal(channel);
        } else {
            leaveChannel(channel.id);
        }
    }

    render() {
        const {channel, isDefault} = this.props;

        if (isDefault) {
            return null;
        }

        if (channel.type === Constants.DM_CHANNEL) {
            return null;
        }

        if (channel.type === Constants.GM_CHANNEL) {
            return null;
        }

        return (
            <li role='presentation'>
                <button
                    role='menuitem'
                    className='style--none'
                    onClick={this.handleLeave}
                >
                    <FormattedMessage
                        id='channel_header.leave'
                        defaultMessage='Leave Channel'
                    />
                </button>
            </li>
        );
    }
}
