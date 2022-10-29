// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Channel} from '@mattermost/types/channels';
import {LeastActiveChannel} from '@mattermost/types/insights';

import Constants from 'utils/constants';

import ConfirmModal from 'components/confirm_modal';

type Props = {
    channel: Channel | LeastActiveChannel;
    onExited: () => void;
    callback?: () => any;
    actions: {
        leaveChannel: (channelId: string) => any;
    };
}

type State = {
    show: boolean;
};

export default class LeaveChannelModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            show: true,
        };
    }

    handleSubmit = () => {
        const {actions, channel, callback} = this.props;

        if (channel) {
            const channelId = channel.id;
            actions.leaveChannel(channelId).then((result: {data: boolean}) => {
                if (result.data) {
                    callback?.();
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
            if (this.props.channel.type === Constants.PRIVATE_CHANNEL) {
                title = (
                    <FormattedMessage
                        id='leave_private_channel_modal.title'
                        defaultMessage='Leave Private Channel {channel}'
                        values={{
                            channel: <b>{this.props.channel.display_name}</b>,
                        }}
                    />
                );
            } else {
                title = (
                    <FormattedMessage
                        id='leave_public_channel_modal.title'
                        defaultMessage='Leave Channel {channel}'
                        values={{
                            channel: <b>{this.props.channel.display_name}</b>,
                        }}
                    />
                );
            }

            if (this.props.channel.type === Constants.PRIVATE_CHANNEL) {
                message = (
                    <FormattedMessage
                        id='leave_private_channel_modal.message'
                        defaultMessage='Are you sure you wish to leave the private channel {channel}? You must be re-invited in order to re-join this channel in the future.'
                        values={{
                            channel: <b>{this.props.channel.display_name}</b>,
                        }}
                    />
                );
            } else {
                message = (
                    <FormattedMessage
                        id='leave_public_channel_modal.message'
                        defaultMessage='Are you sure you wish to leave the channel {channel}? You can re-join this channel in the future if you change your mind.'
                        values={{
                            channel: <b>{this.props.channel.display_name}</b>,
                        }}
                    />
                );
            }
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
