// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {showLeavePrivateChannelModal} from 'actions/global_actions.jsx';
import {Constants} from 'utils/constants';

export default class LeaveChannelOption extends React.PureComponent {
    static propTypes = {

        /**
         * Object with info about user
         */
        channel: PropTypes.object.isRequired,

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
