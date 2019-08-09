// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {RequestStatus} from 'mattermost-redux/constants';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

export default class EditChannelPurposeModal extends React.PureComponent {
    static propTypes = {

        /*
         * callback to call when modal will hide
         */
        onHide: PropTypes.func.isRequired,

        /*
         * Channel info object
         */
        channel: PropTypes.object,

        /*
         * Check should we send purpose on CTRL + ENTER
         */
        ctrlSend: PropTypes.bool.isRequired,

        /*
         * Info about patch serverError
         */
        serverError: PropTypes.object,

        /*
         *  Status of patch info about channel request
         */
        requestStatus: PropTypes.string.isRequired,

        /*
         * Object with redux action creators
         */
        actions: PropTypes.shape({

            /*
             * Action creator to patch current channel
             */
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
            this.onHide();
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

    onHide = () => {
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
        const {channel, actions: {patchChannel}} = this.props;
        const {purpose} = this.state;
        if (!channel) {
            return;
        }

        patchChannel(channel.id, {purpose});
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
                dialogClassName='a11y__modal'
                show={this.state.show}
                onHide={this.onHide}
                onEntering={this.handleEntering}
                onExited={this.props.onHide}
                role='dialog'
                aria-labelledby='editChannelPurposeModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='editChannelPurposeModalLabel'
                    >
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
                        className='btn btn-link cancel-button'
                        onClick={this.onHide}
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
