// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {showLeavePrivateChannelModal} from 'actions/global_actions';
import {Constants} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import Menu from 'components/widgets/menu/menu';

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
         * Boolean whether the user is a guest or no
         */
        isGuestUser: PropTypes.bool.isRequired,

        /**
         * Use for test selector
         */
        id: PropTypes.string,

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

    static defaultProps = {
        isGuestUser: false,
    }

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
        const {channel, isDefault, isGuestUser, id} = this.props;

        return (
            <Menu.ItemAction
                id={id}
                show={(!isDefault || isGuestUser) && channel.type !== Constants.DM_CHANNEL && channel.type !== Constants.GM_CHANNEL}
                onClick={this.handleLeave}
                text={localizeMessage('channel_header.leave', 'Leave Channel')}
            />
        );
    }
}
