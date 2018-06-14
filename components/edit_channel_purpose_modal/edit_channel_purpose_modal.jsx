// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {RequestStatus} from 'mattermost-redux/constants';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

export default class EditChannelPurposeModal extends React.Component {
    static propTypes = {
        channel: PropTypes.object,
        ctrlSend: PropTypes.bool.isRequired,
        serverError: PropTypes.object,
        requestStatus: PropTypes.string.isRequired,
        onModalDismissed: PropTypes.func.isRequired,
        actions: PropTypes.shape({
            getChannel: PropTypes.func.isRequired,
            patchChannel: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            purpose: props.channel.purpose || '',
            serverError: '',
            show: true,
            submitted: false,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        const {requestStatus: nextRequestStatus, serverError: nextServerError} = nextProps;
        const {requestStatus} = this.props;

        if (requestStatus !== nextRequestStatus && nextRequestStatus === RequestStatus.SUCCESS) {
            this.handleHide();
        }

        if (requestStatus !== nextRequestStatus && nextRequestStatus === RequestStatus.FAILURE) {
            this.setError(nextServerError);
        } else {
            this.unsetError();
        }
    }

    setError = (err) => {
        if (err.id === 'api.context.invalid_param.app_error') {
            this.setState({
                serverError: Utils.localizeMessage(
                    'edit_channel_purpose_modal.error',
                    'This channel purpose is too long, please enter a shorter one'
                ),
            });
        } else {
            this.setState({serverError: err.message});
        }
    }

    unsetError = () => {
        this.setState({serverError: ''});
    }

    handleEntering = () => {
        Utils.placeCaretAtEnd(this.purpose);
    }

    handleHide = () => {
        this.setState({show: false});
    }

    handleKeyDown = (e) => {
        const {ctrlSend} = this.props;

        if (ctrlSend && Utils.isKeyPressed(e, Constants.KeyCodes.ENTER) && e.ctrlKey) {
            e.preventDefault();
            this.handleSave(e);
        } else if (!ctrlSend && Utils.isKeyPressed(e, Constants.KeyCodes.ENTER) && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            this.handleSave(e);
        }
    }

    handleSave = () => {
        const {channel, actions: {getChannel, patchChannel}} = this.props;
        const {purpose} = this.state;
        if (!channel) {
            return;
        }

        patchChannel(channel.id, {purpose}).then(() => getChannel(channel.id));
    }

    handleChange = (e) => {
        e.preventDefault();
        this.setState({purpose: e.target.value});
    }

    getPurpose = (node) => {
        this.purpose = node;
    };

    render() {
        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className='form-group has-error'>
                    <br/>
                    <label className='control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        let title = (
            <span>
                <FormattedMessage
                    id='edit_channel_purpose_modal.title1'
                    defaultMessage='Edit Purpose'
                />
            </span>
        );
        if (this.props.channel.display_name) {
            title = (
                <span>
                    <FormattedMessage
                        id='edit_channel_purpose_modal.title2'
                        defaultMessage='Edit Purpose for '
                    />
                    <span className='name'>{this.props.channel.display_name}</span>
                </span>
            );
        }

        let channelPurposeModal = (
            <FormattedMessage
                id='edit_channel_purpose_modal.body'
                defaultMessage='Describe how this channel should be used. This text appears in the channel list in the "More..." menu and helps others decide whether to join.'
            />
        );
        if (this.props.channel.type === 'P') {
            channelPurposeModal = (
                <FormattedMessage
                    id='edit_channel_private_purpose_modal.body'
                    defaultMessage='This text appears in the \"View Info\" modal of the private channel.'
                />
            );
        }

        return (
            <Modal
                className='modal-edit-channel-purpose'
                ref='modal'
                show={this.state.show}
                onHide={this.handleHide}
                onEntering={this.handleEntering}
                onExited={this.props.onModalDismissed}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        {title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        {channelPurposeModal}
                    </p>
                    <textarea
                        ref={this.getPurpose}
                        className='form-control no-resize'
                        rows='6'
                        maxLength='250'
                        value={this.state.purpose}
                        onKeyDown={this.handleKeyDown}
                        onChange={this.handleChange}
                    />
                    {serverError}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-default cancel-button'
                        onClick={this.handleHide}
                    >
                        <FormattedMessage
                            id='edit_channel_purpose_modal.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary save-button'
                        disabled={this.props.requestStatus === RequestStatus.STARTED}
                        onClick={this.handleSave}
                    >
                        <FormattedMessage
                            id='edit_channel_purpose_modal.save'
                            defaultMessage='Save'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
