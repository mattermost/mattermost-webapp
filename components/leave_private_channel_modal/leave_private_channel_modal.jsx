// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import ConfirmModal from 'components/confirm_modal.jsx';

export default class LeavePrivateChannelModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        onHide: PropTypes.func.isRequired,

        channel: PropTypes.shape({
            id: PropTypes.string.isRequired,
            display_name: PropTypes.string.isRequired,
        }).isRequired,

        actions: PropTypes.shape({
            leaveChannel: PropTypes.func.isRequired,
        }).isRequired,
    };

    handleKeyPress = (e) => {
        if (e.key === 'Enter' && this.props.show) {
            this.handleSubmit();
        }
    };

    handleSubmit = () => {
        const {actions, channel} = this.props;

        if (channel) {
            const channelId = channel.id;
            actions.leaveChannel(channelId).then((result) => {
                if (result.data) {
                    this.props.onHide();
                }
            });
        }
    };

    render() {
        let title = '';
        let message = '';
        if (this.props.channel) {
            title = (
                <FormattedMessage
                    id='leave_private_channel_modal.title'
                    defaultMessage='Leave Private Channel {channel}'
                    values={{
                        channel: <b>{this.props.channel.display_name}</b>,
                    }}
                />
            );

            message = (
                <FormattedMessage
                    id='leave_private_channel_modal.message'
                    defaultMessage='Are you sure you wish to leave the private channel {channel}? You must be re-invited in order to re-join this channel in the future.'
                    values={{
                        channel: <b>{this.props.channel.display_name}</b>,
                    }}
                />
            );
        }

        const buttonClass = 'btn btn-danger';
        const button = (
            <FormattedMessage
                id='leave_private_channel_modal.leave'
                defaultMessage='Yes, leave channel'
            />
        );

        return (
            <ConfirmModal
                show={this.props.show}
                title={title}
                message={message}
                confirmButtonClass={buttonClass}
                confirmButtonText={button}
                onConfirm={this.handleSubmit}
                onCancel={this.props.onHide}
            />
        );
    }
}
