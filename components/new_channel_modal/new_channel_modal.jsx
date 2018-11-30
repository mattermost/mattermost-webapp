// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import GlobeIcon from 'components/svg/globe_icon';
import LockIcon from 'components/svg/lock_icon';
import Constants from 'utils/constants.jsx';
import {getShortenedURL} from 'utils/url.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';

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

    constructor(props) {
        super(props);

        this.state = {
            displayNameError: '',
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (nextProps.show === true && this.props.show === false) {
            this.setState({
                displayNameError: '',
            });
        }
    }

    componentDidMount() {
        // ???
        if (UserAgent.isInternetExplorer() || UserAgent.isEdge()) {
            $('body').addClass('browser--ie');
        }
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

        const displayName = ReactDOM.findDOMNode(this.refs.display_name).value.trim();
        if (displayName.length < Constants.MIN_CHANNELNAME_LENGTH) {
            this.setState({displayNameError: true});
            return;
        }

        this.props.onSubmitChannel();
    }

    handleChange = () => {
        const newData = {
            displayName: this.refs.display_name.value,
            header: this.refs.channel_header.value,
            purpose: this.refs.channel_purpose.value,
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
                        defaultMessage='Channel name must be 2 or more characters'
                    />
                    {this.state.displayNameError}
                </p>
            );
            displayNameClass += ' has-error';
        }

        if (this.props.serverError) {
            serverError = <div className='form-group has-error'><div className='col-sm-12'><p className='input__help error'>{this.props.serverError}</p></div></div>;
        }

        let inputPrefixId = '';
        switch (this.props.channelType) {
        case 'P':
            inputPrefixId = 'newPrivateChannel';
            break;
        case 'O':
            inputPrefixId = 'newPublicChannel';
            break;
        }

        const publicChannelDesc = (
            <div>
                <GlobeIcon className='icon icon__globe icon--body type-icon'/>
                <FormattedMessage
                    id='channel_modal.publicName'
                    defaultMessage='Public'
                />
                <FormattedMessage
                    id='channel_modal.publicHint'
                    defaultMessage=' - Anyone can join this channel.'
                />
            </div>
        );

        const privateChannelDesc = (
            <div>
                <LockIcon className='icon icon__lock icon--body type-icon'/>
                <FormattedMessage
                    id='channel_modal.privateName'
                    defaultMessage='Private'
                />
                <FormattedMessage
                    id='channel_modal.privateHint'
                    defaultMessage=' - Only invited members can join this channel.'
                />
            </div>
        );

        let typeOptions = null;
        if (enableTypeSelection) {
            typeOptions = (
                <div key='channelType'>
                    <div className='radio'>
                        <label>
                            <input
                                id='public'
                                type='radio'
                                name='channelType'
                                checked={this.props.channelType === 'O'}
                                onChange={this.handlePublicTypeSelect}
                            />
                            {publicChannelDesc}
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='private'
                                type='radio'
                                name='channelType'
                                checked={this.props.channelType === 'P'}
                                onChange={this.handlePrivateTypeSelect}
                            />
                            {privateChannelDesc}
                        </label>
                        <br/>
                    </div>
                </div>
            );
        } else {
            typeOptions = (
                <div className='type-container'>
                    {canCreatePublicChannel ? publicChannelDesc : null}
                    {canCreatePrivateChannel ? privateChannelDesc : null}
                </div>
            );
        }

        const prettyTeamURL = getShortenedURL();

        return (
            <span>
                <Modal
                    dialogClassName='new-channel__modal new-channel'
                    show={this.props.show}
                    bsSize='large'
                    onHide={this.props.onModalDismissed}
                    onExited={this.props.onModalExited}
                    autoFocus={true}
                    restoreFocus={true}
                >
                    <Modal.Header>
                        <button
                            type='button'
                            className='close'
                            onClick={this.props.onModalDismissed}
                            tabIndex='5'
                        >
                            <span aria-hidden='true'>{'×'}</span>
                            <span className='sr-only'>{'Close'}</span>
                        </button>
                        <Modal.Title>
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
                                <label className='col-sm-3 form__label control-label'>
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
                                <label className='col-sm-3 form__label control-label'>
                                    <FormattedMessage
                                        id='channel_modal.name'
                                        defaultMessage='Name'
                                    />
                                </label>
                                <div className='col-sm-9'>
                                    <input
                                        id={inputPrefixId + 'Name'}
                                        onChange={this.handleChange}
                                        type='text'
                                        ref='display_name'
                                        className='form-control'
                                        placeholder={Utils.localizeMessage('channel_modal.nameEx', 'E.g.: "Bugs", "Marketing", "客户支持"')}
                                        maxLength={Constants.MAX_CHANNELNAME_LENGTH}
                                        value={this.props.channelData.displayName}
                                        autoFocus={true}
                                        tabIndex='1'
                                        onKeyDown={this.onEnterKeyDown}
                                    />
                                    {displayNameError}
                                    <p className='input__help dark'>
                                        {'URL: ' + prettyTeamURL + this.props.channelData.name + ' ('}
                                        <button
                                            className='color--link style--none'
                                            onClick={this.handleOnURLChange}
                                            tabIndex='7'
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
                                    <label className='form__label control-label'>
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
                                        id={inputPrefixId + 'Purpose'}
                                        className='form-control no-resize'
                                        ref='channel_purpose'
                                        rows='4'
                                        placeholder={Utils.localizeMessage('channel_modal.purposeEx', 'E.g.: "A channel to file bugs and improvements"')}
                                        maxLength='250'
                                        value={this.props.channelData.purpose}
                                        onChange={this.handleChange}
                                        tabIndex='2'
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
                                    <label className='form__label control-label'>
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
                                        id={inputPrefixId + 'Header'}
                                        className='form-control no-resize'
                                        ref='channel_header'
                                        rows='4'
                                        placeholder={Utils.localizeMessage('channel_modal.headerEx', 'E.g.: "[Link Title](http://example.com)"')}
                                        maxLength='1024'
                                        value={this.props.channelData.header}
                                        onChange={this.handleChange}
                                        tabIndex='3'
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
                                type='button'
                                className='btn btn-default'
                                onClick={this.props.onModalDismissed}
                                tabIndex='8'
                                onBlur={() => document.getElementById(`${inputPrefixId}Name`).focus()}
                            >
                                <FormattedMessage
                                    id='channel_modal.cancel'
                                    defaultMessage='Cancel'
                                />
                            </button>
                            <button
                                onClick={this.handleSubmit}
                                type='submit'
                                className='btn btn-primary'
                                tabIndex='4'
                            >
                                <FormattedMessage
                                    id='channel_modal.createNew'
                                    defaultMessage='Create New Channel'
                                />
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal>
            </span>
        );
    }
}
