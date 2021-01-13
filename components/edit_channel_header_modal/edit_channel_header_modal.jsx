// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'react-bootstrap';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';

import Textbox from 'components/textbox';
import TextboxLinks from 'components/textbox/textbox_links';
import Constants, {ModalIdentifiers} from 'utils/constants';
import {intlShape} from 'utils/react_intl';
import {isMobile} from 'utils/user_agent';
import {insertLineBreakFromKeyEvent, isKeyPressed, isUnhandledLineBreakKeyCombo, localizeMessage} from 'utils/utils.jsx';
import {t} from 'utils/i18n';

const KeyCodes = Constants.KeyCodes;

const holders = defineMessages({
    error: {
        id: t('edit_channel_header_modal.error'),
        defaultMessage: 'This channel header is too long, please enter a shorter one',
    },
});

class EditChannelHeaderModal extends React.PureComponent {
    static propTypes = {

        /*
         * react-intl helper object
         */
        intl: intlShape.isRequired,

        /*
         * Object with info about current channel ,
         */
        channel: PropTypes.object.isRequired,

        /**
         * Set whether to show the modal or not
         */
        show: PropTypes.bool.isRequired,

        /*
         * boolean should be `ctrl` button pressed to send
         */
        ctrlSend: PropTypes.bool.isRequired,

        /*
         * Should preview be showed
         */
        shouldShowPreview: PropTypes.bool.isRequired,

        /*
         * Collection of redux actions
         */
        actions: PropTypes.shape({

            closeModal: PropTypes.func.isRequired,

            /*
             * patch channel redux-action
             */
            patchChannel: PropTypes.func.isRequired,

            /**
             * Set show preview for textbox
             */
            setShowPreview: PropTypes.func.isRequired,

        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            header: props.channel.header,
            saving: false,
        };
        this.editChannelHeaderTextboxRef = React.createRef();
    }

    handleModalKeyDown = (e) => {
        if (isKeyPressed(e, KeyCodes.ESCAPE)) {
            this.hideModal();
        }
    }

    setShowPreview = (newState) => {
        this.props.actions.setShowPreview(newState);
    }

    handleChange = (e) => {
        this.setState({
            header: e.target.value,
        });
    }

    handleSave = async () => {
        const {header} = this.state;
        if (header === this.props.channel.header) {
            this.hideModal();
            return;
        }

        this.setState({saving: true});

        const {channel, actions} = this.props;
        const {error} = await actions.patchChannel(channel.id, {header});
        if (error) {
            this.setState({serverError: error, saving: false});
        } else {
            this.hideModal();
        }
    }

    hideModal = () => {
        this.props.actions.closeModal(ModalIdentifiers.EDIT_CHANNEL_HEADER);
    }

    focusTextbox = () => {
        if (this.editChannelHeaderTextboxRef.current) {
            this.editChannelHeaderTextboxRef.current.focus();
        }
    }

    blurTextbox = () => {
        if (this.editChannelHeaderTextboxRef.current) {
            this.editChannelHeaderTextboxRef.current.blur();
        }
    }

    handleEntering = () => {
        this.focusTextbox();
    }

    handleKeyDown = (e) => {
        const {ctrlSend} = this.props;

        // listen for line break key combo and insert new line character
        if (isUnhandledLineBreakKeyCombo(e)) {
            this.setState({header: insertLineBreakFromKeyEvent(e)});
        } else if (ctrlSend && isKeyPressed(e, KeyCodes.ENTER) && e.ctrlKey === true) {
            this.handleKeyPress(e);
        }
    }

    handleKeyPress = (e) => {
        const {ctrlSend} = this.props;
        if (!isMobile() && ((ctrlSend && e.ctrlKey) || !ctrlSend)) {
            if (isKeyPressed(e, KeyCodes.ENTER) && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                this.blurTextbox();
                this.handleSave(e);
            }
        }
    }

    renderError = () => {
        const {serverError} = this.state;
        if (!serverError) {
            return null;
        }

        let errorMsg;
        if (serverError.server_error_id === 'model.channel.is_valid.header.app_error') {
            errorMsg = this.props.intl.formatMessage(holders.error);
        } else {
            errorMsg = serverError.message;
        }

        return (
            <div className='form-group has-error'>
                <br/>
                <label className='control-label'>
                    {errorMsg}
                </label>
            </div>
        );
    }

    render() {
        let headerTitle = null;
        if (this.props.channel.type === Constants.DM_CHANNEL) {
            headerTitle = (
                <FormattedMessage
                    id='edit_channel_header_modal.title_dm'
                    defaultMessage='Edit Header'
                />
            );
        } else {
            headerTitle = (
                <FormattedMessage
                    id='edit_channel_header_modal.title'
                    defaultMessage='Edit Header for {channel}'
                    values={{
                        channel: this.props.channel.display_name,
                    }}
                />
            );
        }

        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.props.show}
                keyboard={false}
                onKeyDown={this.handleModalKeyDown}
                onHide={this.hideModal}
                onEntering={this.handleEntering}
                onExited={this.hideModal}
                role='dialog'
                aria-labelledby='editChannelHeaderModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='editChannelHeaderModalLabel'
                    >
                        {headerTitle}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body bsClass='modal-body edit-modal-body'>
                    <div>
                        <p>
                            <FormattedMessage
                                id='edit_channel_header_modal.description'
                                defaultMessage='Edit the text appearing next to the channel name in the channel header.'
                            />
                        </p>
                        <div className='textarea-wrapper'>
                            <Textbox
                                value={this.state.header}
                                onChange={this.handleChange}
                                onKeyPress={this.handleKeyPress}
                                onKeyDown={this.handleKeyDown}
                                supportsCommands={false}
                                suggestionListStyle='bottom'
                                createMessage={localizeMessage('edit_channel_header.editHeader', 'Edit the Channel Header...')}
                                previewMessageLink={localizeMessage('edit_channel_header.previewHeader', 'Edit Header')}
                                handlePostError={this.handlePostError}
                                channelId={this.props.channel.id}
                                id='edit_textbox'
                                ref={this.editChannelHeaderTextboxRef}
                                characterLimit={1024}
                                preview={this.props.shouldShowPreview}
                            />
                        </div>
                        <div className='post-create-footer'>
                            <TextboxLinks
                                characterLimit={1024}
                                showPreview={this.props.shouldShowPreview}
                                ref={this.setTextboxLinksRef}
                                updatePreview={this.setShowPreview}
                                message={this.state.header}
                            />
                        </div>
                        <br/>
                        {this.renderError()}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link cancel-button'
                        onClick={this.hideModal}
                    >
                        <FormattedMessage
                            id='edit_channel_header_modal.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        disabled={this.state.saving}
                        type='button'
                        className='btn btn-primary save-button'
                        onClick={this.handleSave}
                    >
                        <FormattedMessage
                            id='edit_channel_header_modal.save'
                            defaultMessage='Save'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default injectIntl(EditChannelHeaderModal);
/* eslint-enable react/no-string-refs */
