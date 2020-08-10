// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';
import LocalizedInput from 'components/localized_input/localized_input';
import Constants from 'utils/constants.jsx';
import {getShortenedURL} from 'utils/url';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n.jsx';

export default class NewChannelModal extends React.PureComponent {
    static propTypes = {

        /**
         * Set whether to show the modal or not
         */
        show: PropTypes.bool.isRequired,

        /**
         * Id of the active team
         */
        currentTeamId: PropTypes.string.isRequired,

        /**
         * The type of channel to create, 'O' or 'P'
         */
        channelType: PropTypes.string.isRequired,

        /**
         * The data needed to create the channel
         */
        channelData: PropTypes.object.isRequired,

        /**
         * Set to force form submission on CTRL/CMD + ENTER instead of ENTER
         */
        ctrlSend: PropTypes.bool,

        /**
         * Server error from failed channel creation
         */
        serverError: PropTypes.node,

        /**
         * Function used to submit the channel
         */
        onSubmitChannel: PropTypes.func.isRequired,

        /**
         * Function to call when modal is dimissed
         */
        onModalDismissed: PropTypes.func.isRequired,

        /**
         * Function to call when modal has exited
         */
        onModalExited: PropTypes.func,

        /**
         * Function to call to switch channel type
         */
        onTypeSwitched: PropTypes.func.isRequired,

        /**
         * Function to call when edit URL button is pressed
         */
        onChangeURLPressed: PropTypes.func.isRequired,

        /**
         * Function to call when channel data is modified
         */
        onDataChanged: PropTypes.func.isRequired,

        /**
         * Permission to create public channel
         */
        canCreatePublicChannel: PropTypes.bool.isRequired,

        /**
         * Permission to create private channel
         */
        canCreatePrivateChannel: PropTypes.bool.isRequired,
    }

    static getDerivedStateFromProps(props) {
        if (props.show === false) {
            return {displayNameError: ''};
        }

        return null;
    }

    constructor(props) {
        super(props);

        this.state = {
            displayNameError: '',
        };

        this.channelHeaderInput = React.createRef();
        this.channelPurposeInput = React.createRef();
        this.displayNameInput = React.createRef();
    }

    onEnterKeyDown = (e) => {
        const enterPressed = Utils.isKeyPressed(e, Constants.KeyCodes.ENTER);
        const {ctrlSend} = this.props;

        // Enter pressed alone without required cmd or ctrl key
        if (ctrlSend && enterPressed && !e.ctrlKey) {
            e.preventDefault();
        } else if ((ctrlSend && enterPressed && e.ctrlKey) || (!ctrlSend && enterPressed && !e.shiftKey && !e.altKey)) {
            this.handleSubmit(e);
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();

        const displayName = this.displayNameInput.current.value.trim();
        if (displayName.length < Constants.MIN_CHANNELNAME_LENGTH) {
            this.setState({displayNameError: true});
            return;
        }

        this.props.onSubmitChannel();
    }

    handleChange = () => {
        const newData = {
            displayName: this.displayNameInput.current.value,
            header: this.channelHeaderInput.current.value,
            purpose: this.channelPurposeInput.current.value,
        };
        this.props.onDataChanged(newData);
    }

    handleOnURLChange = (e) => {
        e.preventDefault();
        if (this.props.onChangeURLPressed) {
            this.props.onChangeURLPressed();
        }
    }

    handlePublicTypeSelect = () => {
        this.props.onTypeSwitched('O');
    }

    handlePrivateTypeSelect = () => {
        this.props.onTypeSwitched('P');
    }

    render() {
        const {canCreatePublicChannel, canCreatePrivateChannel} = this.props;

        const enableTypeSelection = canCreatePublicChannel && canCreatePrivateChannel;
        var displayNameError = null;
        var serverError = null;
        var displayNameClass = 'form-group';

        if (this.state.displayNameError) {
            displayNameError = (
                <p className='input__help error'>
                    <FormattedMessage
                        id='channel_modal.displayNameError'
                        defaultMessage='Display name must have at least 2 characters.'
                    />
                    {this.state.displayNameError}
                </p>
            );
            displayNameClass += ' has-error';
        }

        if (this.props.serverError) {
            serverError = (
                <div className='form-group has-error'>
                    <div className='col-sm-12'>
                        <p
                            id='createChannelError'
                            className='input__help error'
                        >
                            {this.props.serverError}
                        </p>
                    </div>
                </div>
            );
        }

        const publicChannelDesc = (
            <div className='flex-parent'>
                <GlobeIcon className='icon icon__globe icon--body type-icon'/>
                <FormattedMessage
                    id='channel_modal.publicName'
                    defaultMessage='Public'
                />
                <FormattedMessage
                    id='channel_modal.publicHint'
                    defaultMessage=' - Anyone can join this channel'
                />
            </div>
        );

        const privateChannelDesc = (
            <div className='flex-parent'>
                <LockIcon className='icon icon__lock icon--body type-icon'/>
                <FormattedMessage
                    id='channel_modal.privateName'
                    defaultMessage='Private'
                />
                <FormattedMessage
                    id='channel_modal.privateHint'
                    defaultMessage=' - Only invited members can join this channel'
                />
            </div>
        );

        let typeOptions = null;
        if (enableTypeSelection) {
            typeOptions = (
                <fieldset
                    key='channelType'
                    className='multi-select__radio'
                >
                    <div className='radio'>
                        <label>
                            <input
                                id='public'
                                type='radio'
                                name='channelType'
                                checked={this.props.channelType === 'O'}
                                onChange={this.handlePublicTypeSelect}
                                aria-labelledby='channelModalTypeLabel'
                            />
                            {publicChannelDesc}
                        </label>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='private'
                                type='radio'
                                name='channelType'
                                checked={this.props.channelType === 'P'}
                                onChange={this.handlePrivateTypeSelect}
                                aria-labelledby='channelModalTypeLabel'
                            />
                            {privateChannelDesc}
                        </label>
                    </div>
                </fieldset>
            );
        } else {
            typeOptions = (
                <div className='type-container multi-select__radio'>
                    <div className='radio'>
                        {canCreatePublicChannel ? publicChannelDesc : null}
                        {canCreatePrivateChannel ? privateChannelDesc : null}
                    </div>
                </div>
            );
        }

        const prettyTeamURL = getShortenedURL();

        return (
            <span>
                <Modal
                    dialogClassName='a11y__modal new-channel__modal new-channel'
                    show={this.props.show}
                    bsSize='large'
                    onHide={this.props.onModalDismissed}
                    onExited={this.props.onModalExited}
                    autoFocus={true}
                    restoreFocus={true}
                    role='dialog'
                    aria-labelledby='newChannelModalLabel'
                >
                    <Modal.Header>
                        <button
                            type='button'
                            className='close'
                            onClick={this.props.onModalDismissed}
                            aria-label='Close'
                            title='Close'
                        >
                            <span aria-hidden='true'>{'×'}</span>
                        </button>
                        <Modal.Title
                            componentClass='h1'
                            id='newChannelModalLabel'
                        >
                            <FormattedMessage
                                id='channel_modal.modalTitle'
                                defaultMessage='New Channel'
                            />
                        </Modal.Title>
                    </Modal.Header>
                    <form
                        role='form'
                        className='form-horizontal'
                    >
                        <Modal.Body>
                            <div className='form-group'>
                                <label
                                    className='col-sm-3 form__label control-label'
                                    id='channelModalTypeLabel'
                                >
                                    <FormattedMessage
                                        id='channel_modal.type'
                                        defaultMessage='Type'
                                    />
                                </label>
                                <div className='col-sm-9'>
                                    {typeOptions}
                                </div>
                            </div>
                            <div className={displayNameClass}>
                                <label
                                    className='col-sm-3 form__label control-label'
                                    htmlFor='newChannelName'
                                >
                                    <FormattedMessage
                                        id='channel_modal.name'
                                        defaultMessage='Name'
                                    />
                                </label>
                                <div className='col-sm-9'>
                                    <LocalizedInput
                                        id='newChannelName'
                                        onChange={this.handleChange}
                                        type='text'
                                        ref={this.displayNameInput}
                                        className='form-control'
                                        placeholder={{id: t('channel_modal.nameEx'), defaultMessage: 'E.g.: "Bugs", "Marketing", "客户支持"'}}
                                        maxLength={Constants.MAX_CHANNELNAME_LENGTH}
                                        value={this.props.channelData.displayName}
                                        autoFocus={true}
                                        onKeyDown={this.onEnterKeyDown}
                                    />
                                    {displayNameError}
                                    <p className='input__help dark'>
                                        {'URL: ' + prettyTeamURL + this.props.channelData.name + ' ('}
                                        <button
                                            className='color--link style--none'
                                            onClick={this.handleOnURLChange}
                                        >
                                            <FormattedMessage
                                                id='channel_modal.edit'
                                                defaultMessage='Edit'
                                            />
                                        </button>
                                        {')'}
                                    </p>
                                </div>
                            </div>
                            <div className='form-group'>
                                <div className='col-sm-3'>
                                    <label
                                        className='form__label control-label'
                                        htmlFor='newChannelPurpose'
                                    >
                                        <FormattedMessage
                                            id='channel_modal.purpose'
                                            defaultMessage='Purpose'
                                        />
                                    </label>
                                    <label className='form__label light'>
                                        <FormattedMessage
                                            id='channel_modal.optional'
                                            defaultMessage='(optional)'
                                        />
                                    </label>
                                </div>
                                <div className='col-sm-9'>
                                    <textarea
                                        id='newChannelPurpose'
                                        className='form-control no-resize'
                                        ref={this.channelPurposeInput}
                                        rows='4'
                                        placeholder={Utils.localizeMessage('channel_modal.purposeEx', 'E.g.: "A channel to file bugs and improvements"')}
                                        maxLength='250'
                                        value={this.props.channelData.purpose}
                                        onChange={this.handleChange}
                                    />
                                    <p className='input__help'>
                                        <FormattedMessage
                                            id='channel_modal.descriptionHelp'
                                            defaultMessage='Describe how this channel should be used.'
                                        />
                                    </p>
                                </div>
                            </div>
                            <div className='form-group less'>
                                <div className='col-sm-3'>
                                    <label
                                        className='form__label control-label'
                                        htmlFor='newChannelHeader'
                                    >
                                        <FormattedMessage
                                            id='channel_modal.header'
                                            defaultMessage='Header'
                                        />
                                    </label>
                                    <label className='form__label light'>
                                        <FormattedMessage
                                            id='channel_modal.optional'
                                            defaultMessage='(optional)'
                                        />
                                    </label>
                                </div>
                                <div className='col-sm-9'>
                                    <textarea
                                        id='newChannelHeader'
                                        className='form-control no-resize'
                                        ref={this.channelHeaderInput}
                                        rows='4'
                                        placeholder={Utils.localizeMessage('channel_modal.headerEx', 'E.g.: "[Link Title](http://example.com)"')}
                                        maxLength='1024'
                                        value={this.props.channelData.header}
                                        onChange={this.handleChange}
                                    />
                                    <p className='input__help'>
                                        <FormattedMessage
                                            id='channel_modal.headerHelp'
                                            defaultMessage='Set text that will appear in the header of the channel beside the channel name. For example, include frequently used links by typing [Link Title](http://example.com).'
                                        />
                                    </p>
                                    {serverError}
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button
                                id='cancelNewChannel'
                                type='button'
                                className='btn btn-link'
                                onClick={this.props.onModalDismissed}
                                onBlur={() => document.getElementById('newChannelName').focus()}
                            >
                                <FormattedMessage
                                    id='channel_modal.cancel'
                                    defaultMessage='Cancel'
                                />
                            </button>
                            <button
                                id='submitNewChannel'
                                onClick={this.handleSubmit}
                                type='submit'
                                className='btn btn-primary'
                            >
                                <FormattedMessage
                                    id='channel_modal.createNew'
                                    defaultMessage='Create Channel'
                                />
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal>
            </span>
        );
    }
}
