// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal, Tooltip} from 'react-bootstrap';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';

import LocalizedInput from 'components/localized_input/localized_input';
import OverlayTrigger from 'components/overlay_trigger';
import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants.jsx';
import {intlShape} from 'utils/react_intl';
import {getShortenedURL, validateChannelUrl} from 'utils/url';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';

const holders = defineMessages({
    required: {
        id: t('rename_channel.required'),
        defaultMessage: 'This field is required',
    },
    maxLength: {
        id: t('rename_channel.maxLength'),
        defaultMessage: 'This field must be less than {maxLength, number} characters',
    },
    lowercase: {
        id: t('rename_channel.lowercase'),
        defaultMessage: 'Must be lowercase alphanumeric characters',
    },
    url: {
        id: t('rename_channel.url'),
        defaultMessage: 'URL',
    },
    defaultError: {
        id: t('rename_channel.defaultError'),
        defaultMessage: ' - Cannot be changed for the default channel',
    },
    displayNameHolder: {
        id: t('rename_channel.displayNameHolder'),
        defaultMessage: 'Enter display name',
    },
});

export class RenameChannelModal extends React.PureComponent {
    static propTypes = {

        /**
         * react-intl helper object
         */
        intl: intlShape.isRequired,

        /**
         * Function that is called when modal is hidden
         */
        onHide: PropTypes.func.isRequired,

        /**
         * Object with info about current channel
         */
        channel: PropTypes.object.isRequired,

        /**
         * Object with info about current team
         */
        team: PropTypes.object.isRequired,

        /**
         * String with the current team URL
         */
        currentTeamUrl: PropTypes.string.isRequired,

        /*
         * Object with redux action creators
         */
        actions: PropTypes.shape({

            /*
             * Action creator to patch current channel
             */
            patchChannel: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            displayName: props.channel.display_name,
            channelName: props.channel.name,
            serverError: '',
            urlErrors: '',
            displayNameError: '',
            invalid: false,
            show: true,
        };
    }

    setError = (err) => {
        this.setState({serverError: err.message});
    }

    unsetError = () => {
        this.setState({serverError: ''});
    }

    handleEntering = () => {
        Utils.placeCaretAtEnd(this.textbox);
    }

    handleHide = (e) => {
        if (e) {
            e.preventDefault();
        }

        this.setState({
            serverError: '',
            urlErrors: '',
            displayNameError: '',
            invalid: false,
            show: false,
        });
    }

    handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const channel = Object.assign({}, this.props.channel);
        const oldName = channel.name;
        const oldDisplayName = channel.display_name;
        const state = {serverError: ''};
        const {formatMessage} = this.props.intl;
        const {actions: {patchChannel}} = this.props;

        channel.display_name = this.state.displayName.trim();
        if (!channel.display_name) {
            state.displayNameError = formatMessage(holders.required);
            state.invalid = true;
        } else if (channel.display_name.length > Constants.MAX_CHANNELNAME_LENGTH) {
            state.displayNameError = formatMessage(holders.maxLength, {maxLength: Constants.MAX_CHANNELNAME_LENGTH});
            state.invalid = true;
        } else if (channel.display_name.length < Constants.MIN_CHANNELNAME_LENGTH) {
            state.displayNameError = (
                <FormattedMessage
                    id='rename_channel.minLength'
                    defaultMessage='Channel name must be {minLength, number} or more characters'
                    values={{
                        minLength: Constants.MIN_CHANNELNAME_LENGTH,
                    }}
                />
            );
            state.invalid = true;
        } else {
            state.displayNameError = '';
        }

        channel.name = this.state.channelName.trim();
        const urlErrors = validateChannelUrl(channel.name);
        if (urlErrors.length > 0) {
            state.invalid = true;
        }
        state.urlErrors = urlErrors;

        this.setState(state);

        if (state.invalid) {
            return;
        }
        if (oldName === channel.name && oldDisplayName === channel.display_name) {
            this.onSaveSuccess();
            return;
        }

        const {data, error} = await patchChannel(channel.id, channel);

        if (data) {
            this.onSaveSuccess();
        } else if (error) {
            this.setError(error);
        }
    }

    onSaveSuccess = () => {
        this.handleHide();
        this.unsetError();
        browserHistory.push('/' + this.props.team.name + '/channels/' + this.state.channelName);
    }

    handleCancel = (e) => {
        this.setState({
            displayName: this.props.channel.display_name,
            channelName: this.props.channel.name,
        });

        this.handleHide(e);
    }

    onNameChange = (e) => {
        const name = e.target.value.trim().replace(/[^A-Za-z0-9-_]/g, '').toLowerCase();
        this.setState({channelName: name});
    }

    onDisplayNameChange = (e) => {
        this.setState({displayName: e.target.value});
    }

    getTextbox = (node) => {
        this.textbox = node;
    }

    render() {
        let displayNameError = null;
        if (this.state.displayNameError) {
            displayNameError = <p className='input__help error'>{this.state.displayNameError}</p>;
        }

        let urlErrors = null;
        let urlHelpText = null;
        let urlInputClass = 'input-group input-group--limit';
        if (this.state.urlErrors.length > 0) {
            urlErrors = <p className='input__help error'>{this.state.urlErrors}</p>;
            urlInputClass += ' has-error';
        } else {
            urlHelpText = (
                <p className='input__help'>
                    <FormattedMessage
                        id='change_url.helpText'
                        defaultMessage='You can use lowercase letters, numbers, dashes, and underscores.'
                    />
                </p>
            );
        }

        let serverError = null;
        if (this.state.serverError) {
            serverError = <div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div>;
        }

        const {formatMessage} = this.props.intl;

        let urlInputLabel = formatMessage(holders.url);
        let readOnlyHandleInput = false;
        if (this.props.channel.name === Constants.DEFAULT_CHANNEL) {
            urlInputLabel += formatMessage(holders.defaultError);
            readOnlyHandleInput = true;
        }

        const fullUrl = this.props.currentTeamUrl + '/channels';
        const shortUrl = getShortenedURL(fullUrl, 35);
        const urlTooltip = (
            <Tooltip id='urlTooltip'>{fullUrl}</Tooltip>
        );

        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.state.show}
                onHide={this.handleCancel}
                onEntering={this.handleEntering}
                onExited={this.props.onHide}
                role='dialog'
                aria-labelledby='renameChannelModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='renameChannelModalLabel'
                    >
                        <FormattedMessage
                            id='rename_channel.title'
                            defaultMessage='Rename Channel'
                        />
                    </Modal.Title>
                </Modal.Header>
                <form role='form'>
                    <Modal.Body>
                        <div className='form-group'>
                            <label className='control-label'>
                                <FormattedMessage
                                    id='rename_channel.displayName'
                                    defaultMessage='Display Name'
                                />
                            </label>
                            <LocalizedInput
                                onChange={this.onDisplayNameChange}
                                type='text'
                                ref={this.getTextbox}
                                id='display_name'
                                className='form-control'
                                placeholder={holders.displayNameHolder}
                                value={this.state.displayName}
                                maxLength={Constants.MAX_CHANNELNAME_LENGTH}
                                aria-label={formatMessage({id: 'rename_channel.displayName', defaultMessage: 'Display Name'}).toLowerCase()}
                            />
                            {displayNameError}
                        </div>
                        <div className='form-group'>
                            <label className='control-label'>{urlInputLabel}</label>

                            <div className={urlInputClass}>
                                <OverlayTrigger
                                    delayShow={Constants.OVERLAY_TIME_DELAY}
                                    placement='top'
                                    overlay={urlTooltip}
                                >
                                    <span className='input-group-addon'>{shortUrl}</span>
                                </OverlayTrigger>
                                <input
                                    onChange={this.onNameChange}
                                    type='text'
                                    className='form-control'
                                    id='channel_name'
                                    value={this.state.channelName}
                                    maxLength={Constants.MAX_CHANNELNAME_LENGTH}
                                    readOnly={readOnlyHandleInput}
                                    aria-label={formatMessage({id: 'rename_channel.title', defaultMessage: 'Rename Channel'}).toLowerCase()}
                                />
                            </div>
                            {urlHelpText}
                            {urlErrors}
                        </div>
                        {serverError}
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type='button'
                            className='btn btn-link'
                            onClick={this.handleCancel}
                        >
                            <FormattedMessage
                                id='rename_channel.cancel'
                                defaultMessage='Cancel'
                            />
                        </button>
                        <button
                            onClick={this.handleSubmit}
                            type='submit'
                            id='save-button'
                            className='btn btn-primary'
                        >
                            <FormattedMessage
                                id='rename_channel.save'
                                defaultMessage='Save'
                            />
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}

export default injectIntl(RenameChannelModal);
