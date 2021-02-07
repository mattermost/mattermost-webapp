// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import ConfirmModal from 'components/confirm_modal';

type Props = {
    channelName: string;
    onCancel: () => void;
    onHide: () => void;
    onJoin: () => void;
}

type State = {
    show: boolean;
}

export default class JoinPrivateChannelModal extends React.PureComponent<Props, State> {
    join = false;

    constructor(props: Props) {
        super(props);
        this.state = {
            show: true,
        };
    }

    onJoin = () => {
        this.join = true;
        this.onHide();
    }

    onHide = () => {
        this.setState({show: false});
    }

    onExited = () => {
        if (this.join) {
            if (typeof this.props.onJoin === 'function') {
                this.props.onJoin();
            }
        } else if (typeof this.props.onCancel === 'function') {
            this.props.onCancel();
        }
        if (this.props.onHide) {
            this.props.onHide();
        }
    }

    render() {
        return (
            <ConfirmModal
                show={this.state.show}
                title={
                    <FormattedMessage
                        id='permalink.show_dialog_warn.title'
                        defaultMessage='Join private channel'
                    />
                }
                message={
                    <FormattedMessage
                        id='permalink.show_dialog_warn.description'
                        defaultMessage='You are about to join {channel} without explicitly being added by the channel admin. Are you sure you wish to join this private channel?'
                        values={{
                            channel: <b>{this.props.channelName}</b>,
                        }}
                    />
                }
                confirmButtonText={
                    <FormattedMessage
                        id='permalink.show_dialog_warn.join'
                        defaultMessage='Join'
                    />
                }
                onConfirm={this.onJoin}
                onCancel={this.onHide}
                onExited={this.onExited}
            />
        );
    }
}
