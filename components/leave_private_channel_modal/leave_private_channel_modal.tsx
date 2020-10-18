// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';

import ModalStore from 'stores/modal_store.jsx';
import Constants from 'utils/constants';
import ConfirmModal from 'components/confirm_modal';

type State = {
    show: boolean;
    channel?: Channel;
};

type Props = {
    actions: {
        leaveChannel: (channelId: any) => any;
    };
}

export default class LeavePrivateChannelModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            show: false,
        };
    }

    componentDidMount() {
        ModalStore.addModalListener(Constants.ActionTypes.TOGGLE_LEAVE_PRIVATE_CHANNEL_MODAL, this.handleToggle);
    }

    componentWillUnmount() {
        ModalStore.removeModalListener(Constants.ActionTypes.TOGGLE_LEAVE_PRIVATE_CHANNEL_MODAL, this.handleToggle);
    }

    handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && this.state.show) {
            this.handleSubmit();
        }
    };

    handleSubmit = () => {
        const {actions} = this.props;
        const {channel} = this.state;

        if (channel) {
            const channelId = channel.id;
            actions.leaveChannel(channelId).then((result: {data: boolean}) => {
                if (result.data) {
                    this.handleHide();
                }
            });
        }
    };

    handleToggle = (value: Channel): void => {
        this.setState({
            channel: value,
            show: value !== null,
        });
    };

    handleHide = () => {
        this.setState({
            show: false,
        });
    };

    render() {
        let title;
        let message;
        if (this.state.channel && this.state.channel.display_name) {
            title = (
                <FormattedMessage
                    id='leave_private_channel_modal.title'
                    defaultMessage='Leave Private Channel {channel}'
                    values={{
                        channel: <b>{this.state.channel.display_name}</b>,
                    }}
                />
            );

            message = (
                <FormattedMessage
                    id='leave_private_channel_modal.message'
                    defaultMessage='Are you sure you wish to leave the private channel {channel}? You must be re-invited in order to re-join this channel in the future.'
                    values={{
                        channel: <b>{this.state.channel.display_name}</b>,
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
            />
        );
    }
}
