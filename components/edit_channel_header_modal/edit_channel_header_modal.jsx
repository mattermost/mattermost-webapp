// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'react-bootstrap';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';

import {RequestStatus} from 'mattermost-redux/constants';

import Textbox from 'components/textbox';
import TextboxLinks from 'components/textbox/textbox_links.jsx';
import Constants from 'utils/constants.jsx';
import {isMobile} from 'utils/user_agent.jsx';
import {isKeyPressed, localizeMessage} from 'utils/utils.jsx';
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
         * callback to call when modal will hide
         */
        onHide: PropTypes.func.isRequired,

        /*
         * Object with info about current channel ,
         */
        channel: PropTypes.object.isRequired,

        /*
         * boolean should be `ctrl` button pressed to send
         */
        ctrlSend: PropTypes.bool.isRequired,

        /*
         * object with info about server error
         */
        serverError: PropTypes.object,

        /*
         * string with info about about request
         */
        requestStatus: PropTypes.string.isRequired,

        /*
         * Collection of redux actions
         */
        actions: PropTypes.shape({

            /*
             * patch channel redux-action
             */
            patchChannel: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            preview: false,
            header: props.channel.header,
            show: true,
            showError: false,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        const {requestStatus: nextRequestStatus} = nextProps;
        const {requestStatus} = this.props;

        if (requestStatus !== nextRequestStatus && nextRequestStatus === RequestStatus.FAILURE) {
            this.setState({showError: true});
        } else if (requestStatus !== nextRequestStatus && nextRequestStatus === RequestStatus.SUCCESS) {
            this.onHide();
        } else {
            this.setState({showError: false});
        }
    }

    updatePreview = (newState) => {
        this.setState({preview: newState});
    }

    handleChange = (e) => {
        this.setState({
            header: e.target.value,
        });
    }

    handleSave = () => {
        const {channel, actions: {patchChannel}} = this.props;
        const {header} = this.state;
        patchChannel(channel.id, {header});
    }

    onHide = () => {
        this.setState({show: false});
    }

    focusTextbox = () => {
        if (this.refs.editChannelHeaderTextbox) {
            this.refs.editChannelHeaderTextbox.getWrappedInstance().focus();
        }
    }

    blurTextbox = () => {
        if (this.refs.editChannelHeaderTextbox) {
            this.refs.editChannelHeaderTextbox.getWrappedInstance().blur();
        }
    }

    handleEntering = () => {
        this.focusTextbox();
    }

    handleKeyDown = (e) => {
        const {ctrlSend} = this.props;
        if (ctrlSend && isKeyPressed(e, KeyCodes.ENTER) && e.ctrlKey === true) {
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

    render() {
        let serverError = null;
        if (this.props.serverError && this.state.showError) {
            let errorMsg;
            if (this.props.serverError.server_error_id === 'model.channel.is_valid.header.app_error') {
                errorMsg = this.props.intl.formatMessage(holders.error);
            } else {
                errorMsg = this.props.serverError.message;
            }

            serverError = (
                <div className='form-group has-error'>
                    <br/>
                    <label className='control-label'>
                        {errorMsg}
                    </label>
                </div>
            );
        }

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
                show={this.state.show}
                onHide={this.onHide}
                onEntering={this.handleEntering}
                onExited={this.props.onHide}
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
                                id='edit_textbox'
                                ref='editChannelHeaderTextbox'
                                characterLimit={1024}
                                preview={this.state.preview}
                            />
                        </div>
                        <div className='post-create-footer'>
                            <TextboxLinks
                                characterLimit={1024}
                                showPreview={this.state.preview}
                                ref={this.setTextboxLinksRef}
                                updatePreview={this.updatePreview}
                                message={this.state.header}
                            />
                        </div>
                        <br/>
                        {serverError}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link cancel-button'
                        onClick={this.onHide}
                    >
                        <FormattedMessage
                            id='edit_channel_header_modal.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        disabled={this.props.requestStatus === RequestStatus.STARTED}
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
