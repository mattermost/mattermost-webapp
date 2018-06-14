// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {Modal} from 'react-bootstrap';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import {RequestStatus} from 'mattermost-redux/constants';

import Textbox from 'components/textbox.jsx';
import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';

const KeyCodes = Constants.KeyCodes;

const holders = defineMessages({
    error: {
        id: 'edit_channel_header_modal.error',
        defaultMessage: 'This channel header is too long, please enter a shorter one',
    },
});

class EditChannelHeaderModal extends React.PureComponent {
    static propTypes = {
        intl: intlShape.isRequired,
        onHide: PropTypes.func.isRequired,
        channel: PropTypes.object.isRequired,
        ctrlSend: PropTypes.bool.isRequired,
        serverError: PropTypes.object,
        requestStatus: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            getChannel: PropTypes.func.isRequired,
            patchChannel: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
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

    handleChange = (e) => {
        this.setState({
            header: e.target.value,
        });
    }

    handleSave = () => {
        const {channel, actions: {getChannel, patchChannel}} = this.props;
        const {header} = this.state;
        patchChannel(channel.id, {header}).then(() => getChannel(channel.id));
    }

    onHide = () => {
        this.setState({show: false});
    }

    focusTextbox = () => {
        if (!Utils.isMobile()) {
            this.refs.editChannelHeaderTextbox.focus();
        }
    }

    handleEntering = () => {
        this.focusTextbox();
    }

    handleKeyDown = (e) => {
        const {ctrlSend} = this.props;
        if (ctrlSend && Utils.isKeyPressed(e, KeyCodes.ENTER) && e.ctrlKey === true) {
            this.handleKeyPress(e);
        }
    }

    handleKeyPress = (e) => {
        const {ctrlSend} = this.props;
        if (!UserAgent.isMobile() && ((ctrlSend && e.ctrlKey) || !ctrlSend)) {
            if (Utils.isKeyPressed(e, KeyCodes.ENTER) && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                ReactDOM.findDOMNode(this.refs.editChannelHeaderTextbox).blur();
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
                show={this.state.show}
                onHide={this.onHide}
                onEntering={this.handleEntering}
                onExited={this.props.onHide}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
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
                        <Textbox
                            value={this.state.header}
                            onChange={this.handleChange}
                            onKeyPress={this.handleKeyPress}
                            onKeyDown={this.handleKeyDown}
                            supportsCommands={false}
                            suggestionListStyle='bottom'
                            createMessage={Utils.localizeMessage('edit_channel_header.editHeader', 'Edit the Channel Header...')}
                            previewMessageLink={Utils.localizeMessage('edit_channel_header.previewHeader', 'Edit Header')}
                            handlePostError={this.handlePostError}
                            id='edit_textbox'
                            ref='editChannelHeaderTextbox'
                            characterLimit={1024}
                        />
                        <br/>
                        {serverError}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-default cancel-button'
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

