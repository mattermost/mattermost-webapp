// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';

import ConfirmModal from 'components/confirm_modal';

type State = {
    show: boolean;
};

type Props = {
    channel?: Channel;
    onExited: () => void;
    actions: {
        leaveChannel: (channelId: string) => any;
    };
}

export default class LeavePrivateChannelModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            show: true,
        };
    }

    handleSubmit = () => {
        const {actions, channel} = this.props;

        if (channel) {
            const channelId = channel.id;
            actions.leaveChannel(channelId).then((result: {data: boolean}) => {
                if (result.data) {
                    this.handleHide();
                }
            });
        }
    };

    handleHide = () => {
        this.setState({
            show: false,
        });
    };

    render() {
        let title;
        let message;
        if (this.props.channel && this.props.channel.display_name) {
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
                show={this.state.show}
                title={title}
                message={message}
                confirmButtonClass={buttonClass}
                confirmButtonText={button}
                onConfirm={this.handleSubmit}
                onCancel={this.handleHide}
                onExited={this.props.onExited}
            />
        );
    }
}
