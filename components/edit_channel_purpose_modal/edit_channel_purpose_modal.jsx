// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, injectIntl} from 'react-intl';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

class EditChannelPurposeModal extends React.PureComponent {
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

        intl: PropTypes.any,

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
            requestStarted: false,
        };
    }

    setError = (err) => {
        if (err.id === 'api.context.invalid_param.app_error') {
            this.setState({
                serverError: Utils.localizeMessage(
                    'edit_channel_purpose_modal.error',
                    'This channel purpose is too long, please enter a shorter one',
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

        // listen for line break key combo and insert new line character
        if (Utils.isUnhandledLineBreakKeyCombo(e)) {
            e.preventDefault();
            this.setState({purpose: Utils.insertLineBreakFromKeyEvent(e)});
        } else if (ctrlSend && Utils.isKeyPressed(e, Constants.KeyCodes.ENTER) && e.ctrlKey) {
            e.preventDefault();
            this.handleSave(e);
        } else if (!ctrlSend && Utils.isKeyPressed(e, Constants.KeyCodes.ENTER) && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            this.handleSave(e);
        }
    }

    handleSave = async () => {
        const {channel, actions: {patchChannel}} = this.props;
        const {purpose} = this.state;
        if (!channel) {
            return;
        }

        this.setState({requestStarted: true});
        const {data, error} = await patchChannel(channel.id, {purpose});
        this.setState({requestStarted: false});

        if (data) {
            this.unsetError();
            this.onHide();
        } else if (error) {
            this.setError(error);
        }
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
        const {formatMessage} = this.props.intl;

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

        const ariaLabelForTitle = formatMessage({id: 'edit_channel_purpose_modal.title1', defaultMessage: 'Edit Purpose'}).toLowerCase();
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
                        aria-label={ariaLabelForTitle}
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
                        disabled={this.state.requestStarted}
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

export default injectIntl(EditChannelPurposeModal);
