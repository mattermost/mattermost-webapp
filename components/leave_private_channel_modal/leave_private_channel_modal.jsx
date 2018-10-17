// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';

import ModalStore from 'stores/modal_store.jsx';
import Constants from 'utils/constants.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';

class LeavePrivateChannelModal extends React.Component {
    static propTypes = {
        actions: PropTypes.shape({
            leaveChannel: PropTypes.func.isRequired,
        }).isRequired,
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            show: false,
            channel: null,
        };
    }

    componentDidMount() {
        ModalStore.addModalListener(Constants.ActionTypes.TOGGLE_LEAVE_PRIVATE_CHANNEL_MODAL, this.handleToggle);
    }

    componentWillUnmount() {
        ModalStore.removeModalListener(Constants.ActionTypes.TOGGLE_LEAVE_PRIVATE_CHANNEL_MODAL, this.handleToggle);
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter' && this.state.show) {
            this.handleSubmit();
        }
    };

    handleSubmit = () => {
        const {actions} = this.props;
        const {channel} = this.state;

        if (channel) {
            const channelId = channel.id;
            actions.leaveChannel(channelId).then((result) => {
                if (result.data) {
                    this.handleHide();
                }
            });
        }
    };

    handleToggle = (value) => {
        this.setState({
            channel: value,
            show: value !== null,
        });
    };

    handleHide = () => {
        this.setState({
            show: false,
            channel: null,
        });
    };

    render() {
        let title = '';
        let message = '';
        if (this.state.channel) {
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

export default injectIntl(LeavePrivateChannelModal);
