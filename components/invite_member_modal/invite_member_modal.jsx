// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import {defineMessages, FormattedHTMLMessage, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import * as GlobalActions from 'actions/global_actions.jsx';
import {inviteMembers} from 'actions/team_actions.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import ModalStore from 'stores/modal_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import Constants from 'utils/constants.jsx';
import * as utils from 'utils/utils.jsx';

import ConfirmModal from 'components/confirm_modal.jsx';

const ActionTypes = Constants.ActionTypes;

const holders = defineMessages({
    emailError: {
        id: 'invite_member.emailError',
        defaultMessage: 'Please enter a valid email address',
    },
    firstname: {
        id: 'invite_member.firstname',
        defaultMessage: 'First name',
    },
    lastname: {
        id: 'invite_member.lastname',
        defaultMessage: 'Last name',
    },
    modalTitle: {
        id: 'invite_member.modalTitle',
        defaultMessage: 'Discard Invitations?',
    },
    modalMessage: {
        id: 'invite_member.modalMessage',
        defaultMessage: 'You have unsent invitations, are you sure you want to discard them?',
    },
    modalButton: {
        id: 'invite_member.modalButton',
        defaultMessage: 'Yes, Discard',
    },
});

class InviteMemberModal extends React.Component {
    constructor(props) {
        super(props);

        const team = TeamStore.getCurrent();

        this.state = {
            show: false,
            inviteIds: [0],
            idCount: 0,
            emailErrors: {},
            firstNameErrors: {},
            lastNameErrors: {},
            showConfirmModal: false,
            isSendingEmails: false,
            teamType: team ? team.type : null,
        };
    }

    teamChange = () => {
        const team = TeamStore.getCurrent();
        const teamType = team ? team.type : null;
        this.setState({
            teamType,
        });
    }

    componentDidMount() {
        ModalStore.addModalListener(ActionTypes.TOGGLE_INVITE_MEMBER_MODAL, this.handleToggle);
        TeamStore.addChangeListener(this.teamChange);
    }

    componentWillUnmount() {
        ModalStore.removeModalListener(ActionTypes.TOGGLE_INVITE_MEMBER_MODAL, this.handleToggle);
        TeamStore.removeChangeListener(this.teamChange);
    }

    handleToggle = (value) => {
        this.setState({
            show: value,
            serverError: null,
        });
    }

    handleSubmit = () => {
        if (!this.props.sendEmailNotifications) {
            return;
        }

        var inviteIds = this.state.inviteIds;
        var count = inviteIds.length;
        var invites = [];
        var emailErrors = this.state.emailErrors;
        var firstNameErrors = this.state.firstNameErrors;
        var lastNameErrors = this.state.lastNameErrors;
        var valid = true;

        for (var i = 0; i < count; i++) {
            var invite = {};
            var index = inviteIds[i];
            invite.email = ReactDOM.findDOMNode(this.refs['email' + index]).value.trim();
            invite.firstName = ReactDOM.findDOMNode(this.refs['first_name' + index]).value.trim();
            invite.lastName = ReactDOM.findDOMNode(this.refs['last_name' + index]).value.trim();
            if (invite.email !== '' || index === 0) {
                if (!invite.email || !utils.isEmail(invite.email)) {
                    emailErrors[index] = this.props.intl.formatMessage(holders.emailError);
                    valid = false;
                } else {
                    emailErrors[index] = '';
                }
                invites.push(invite);
            }
        }

        this.setState({emailErrors, firstNameErrors, lastNameErrors});

        if (!valid || invites.length === 0) {
            return;
        }

        var data = {};
        data.invites = invites;

        this.setState({isSendingEmails: true});

        inviteMembers(
            data,
            () => {
                this.handleHide(false);
                this.setState({isSendingEmails: false});
            },
            (err) => {
                if (err.id === 'api.team.invite_members.already.app_error') {
                    emailErrors[err.detailed_error] = err.message;
                    this.setState({emailErrors});
                } else {
                    this.setState({serverError: err.message});
                }

                this.setState({isSendingEmails: false});
            }
        );
    }

    handleHide = (requireConfirm) => {
        if (requireConfirm) {
            var notEmpty = false;
            for (var i = 0; i < this.state.inviteIds.length; i++) {
                var index = this.state.inviteIds[i];
                if (ReactDOM.findDOMNode(this.refs['email' + index]).value.trim() !== '') {
                    notEmpty = true;
                    break;
                }
            }

            if (notEmpty) {
                this.setState({
                    showConfirmModal: true,
                });

                return;
            }
        }

        this.clearFields();

        this.setState({
            show: false,
            showConfirmModal: false,
        });
    }

    addInviteFields = () => {
        var count = this.state.idCount + 1;
        var inviteIds = this.state.inviteIds;
        inviteIds.push(count);
        this.setState({inviteIds, idCount: count});
    }

    clearFields = () => {
        var inviteIds = this.state.inviteIds;

        for (var i = 0; i < inviteIds.length; i++) {
            var index = inviteIds[i];
            ReactDOM.findDOMNode(this.refs['email' + index]).value = '';
            ReactDOM.findDOMNode(this.refs['first_name' + index]).value = '';
            ReactDOM.findDOMNode(this.refs['last_name' + index]).value = '';
        }

        this.setState({
            inviteIds: [0],
            idCount: 0,
            emailErrors: {},
            firstNameErrors: {},
            lastNameErrors: {},
        });
    }

    removeInviteFields = (index) => {
        var count = this.state.idCount;
        var inviteIds = this.state.inviteIds;
        var i = inviteIds.indexOf(index);
        if (i > -1) {
            inviteIds.splice(i, 1);
        }
        if (!inviteIds.length) {
            inviteIds.push(++count);
        }
        this.setState({inviteIds, idCount: count});
    }

    showGetTeamInviteLinkModal = () => {
        this.handleHide(false);

        GlobalActions.showGetTeamInviteLinkModal();
    }

    handleKeyDown = (e) => {
        if (utils.isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            e.preventDefault();
            this.handleSubmit();
        }
    }

    hideConfirmModal = () => {
        this.setState({showConfirmModal: false});
    }

    render() {
        var currentUser = UserStore.getCurrentUser();
        const {formatMessage} = this.props.intl;

        if (currentUser != null && this.state.teamType != null) {
            var inviteSections = [];
            var inviteIds = this.state.inviteIds;
            for (var i = 0; i < inviteIds.length; i++) {
                var index = inviteIds[i];
                var emailError = null;
                if (this.state.emailErrors[index]) {
                    emailError = <label className='control-label'>{this.state.emailErrors[index]}</label>;
                }
                var firstNameError = null;
                if (this.state.firstNameErrors[index]) {
                    firstNameError = <label className='control-label'>{this.state.firstNameErrors[index]}</label>;
                }
                var lastNameError = null;
                if (this.state.lastNameErrors[index]) {
                    lastNameError = <label className='control-label'>{this.state.lastNameErrors[index]}</label>;
                }

                var removeButton = null;
                if (index) {
                    removeButton = (
                        <div>
                            <button
                                type='button'
                                className='btn btn-link remove__member'
                                onClick={this.removeInviteFields.bind(this, index)}
                            >
                                <span className='fa fa-trash'/>
                            </button>
                        </div>
                    );
                }
                var emailClass = 'form-group invite';
                if (emailError) {
                    emailClass += ' has-error';
                }

                var nameFields = null;

                var firstNameClass = 'form-group';
                if (firstNameError) {
                    firstNameClass += ' has-error';
                }
                var lastNameClass = 'form-group';
                if (lastNameError) {
                    lastNameClass += ' has-error';
                }
                nameFields = (
                    <div className='row row--invite'>
                        <div className='col-sm-6'>
                            <div className={firstNameClass}>
                                <input
                                    onKeyDown={this.handleKeyDown}
                                    type='text'
                                    className='form-control'
                                    ref={'first_name' + index}
                                    placeholder={formatMessage(holders.firstname)}
                                    maxLength='64'
                                    disabled={!this.props.sendEmailNotifications || !this.props.enableUserCreation}
                                    spellCheck='false'
                                />
                                {firstNameError}
                            </div>
                        </div>
                        <div className='col-sm-6'>
                            <div className={lastNameClass}>
                                <input
                                    onKeyDown={this.handleKeyDown}
                                    type='text'
                                    className='form-control'
                                    ref={'last_name' + index}
                                    placeholder={formatMessage(holders.lastname)}
                                    maxLength='64'
                                    disabled={!this.props.sendEmailNotifications || !this.props.enableUserCreation}
                                    spellCheck='false'
                                />
                                {lastNameError}
                            </div>
                        </div>
                    </div>
                );

                inviteSections[index] = (
                    <div key={'key' + index}>
                        {removeButton}
                        <div className={emailClass}>
                            <input
                                onKeyUp={this.displayNameKeyUp}
                                onKeyDown={this.handleKeyDown}
                                type='text'
                                ref={'email' + index}
                                className='form-control'
                                placeholder='email@domain.com'
                                maxLength='64'
                                disabled={!this.props.sendEmailNotifications || !this.props.enableUserCreation}
                                spellCheck='false'
                                autoFocus={true}
                            />
                            {emailError}
                        </div>
                        {nameFields}
                    </div>
                );
            }

            var serverError = null;
            if (this.state.serverError) {
                serverError = <div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div>;
            }

            var content = null;
            var sendButton = null;

            var defaultChannelName = '';
            if (ChannelStore.getByName(Constants.DEFAULT_CHANNEL)) {
                defaultChannelName = ChannelStore.getByName(Constants.DEFAULT_CHANNEL).display_name;
            }

            if (this.props.sendEmailNotifications && this.props.enableUserCreation) {
                content = (
                    <div>
                        {serverError}
                        <button
                            type='button'
                            className='btn btn-default'
                            onClick={this.addInviteFields}
                        >
                            <FormattedMessage
                                id='invite_member.addAnother'
                                defaultMessage='Add another'
                            />
                        </button>
                        <br/>
                        <br/>
                        <span>
                            <FormattedHTMLMessage
                                id='invite_member.autoJoin'
                                defaultMessage='People invited automatically join the <strong>{channel}</strong> channel.'
                                values={{
                                    channel: defaultChannelName,
                                }}
                            />
                        </span>
                    </div>
                );

                var sendButtonLabel = (
                    <FormattedMessage
                        id='invite_member.send'
                        defaultMessage='Send Invitation'
                    />
                );
                if (this.state.isSendingEmails) {
                    sendButtonLabel = (
                        <span><i className='fa fa-spinner fa-spin'/>
                            <FormattedMessage
                                id='invite_member.sending'
                                defaultMessage=' Sending'
                            />
                        </span>
                    );
                } else if (this.state.inviteIds.length > 1) {
                    sendButtonLabel = (
                        <FormattedMessage
                            id='invite_member.send2'
                            defaultMessage='Send Invitations'
                        />
                    );
                }

                sendButton = (
                    <button
                        onClick={this.handleSubmit}
                        type='button'
                        className='btn btn-primary'
                        disabled={this.state.isSendingEmails}
                    >
                        {sendButtonLabel}
                    </button>
                );
            } else if (this.props.enableUserCreation) {
                var teamInviteLink = null;
                if (currentUser && this.state.teamType === 'O') {
                    var link = (
                        <button
                            className='color--link style--none'
                            onClick={this.showGetTeamInviteLinkModal}
                        >
                            <FormattedMessage
                                id='invite_member.inviteLink'
                                defaultMessage='Team Invite Link'
                            />
                        </button>
                    );

                    teamInviteLink = (
                        <p>
                            <FormattedMessage
                                id='invite_member.teamInviteLink'
                                defaultMessage='You can also invite people using the {link}.'
                                values={{
                                    link,
                                }}
                            />
                        </p>
                    );
                }

                content = (
                    <div>
                        <p>
                            <FormattedMessage
                                id='invite_member.content'
                                defaultMessage='Email is currently disabled for your team, and email invitations cannot be sent. Contact your System Administrator to enable email and email invitations.'
                            />
                        </p>
                        {teamInviteLink}
                    </div>
                );
            } else {
                content = (
                    <div>
                        <p>
                            <FormattedMessage
                                id='invite_member.disabled'
                                defaultMessage='User creation has been disabled for your team. Please ask your Team Administrator for details.'
                            />
                        </p>
                    </div>
                );
            }

            return (
                <div>
                    <Modal
                        dialogClassName='modal-invite-member'
                        show={this.state.show}
                        onHide={this.handleHide.bind(this, true)}
                        enforceFocus={!this.state.showConfirmModal}
                        backdrop={this.state.isSendingEmails ? 'static' : true}
                    >
                        <Modal.Header closeButton={!this.state.isSendingEmails}>
                            <Modal.Title>
                                <FormattedMessage
                                    id='invite_member.newMember'
                                    defaultMessage='Send Email Invite'
                                />
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body ref='modalBody'>
                            <form role='form'>
                                {inviteSections}
                            </form>
                            {content}
                        </Modal.Body>
                        <Modal.Footer>
                            <button
                                type='button'
                                className='btn btn-default'
                                onClick={this.handleHide.bind(this, true)}
                                disabled={this.state.isSendingEmails}
                            >
                                <FormattedMessage
                                    id='invite_member.cancel'
                                    defaultMessage='Cancel'
                                />
                            </button>
                            {sendButton}
                        </Modal.Footer>
                    </Modal>
                    <ConfirmModal
                        title={formatMessage(holders.modalTitle)}
                        message={formatMessage(holders.modalMessage)}
                        confirmButtonText={formatMessage(holders.modalButton)}
                        show={this.state.showConfirmModal}
                        onConfirm={this.handleHide.bind(this, false)}
                        onCancel={this.hideConfirmModal}
                    />
                </div>
            );
        }

        return null;
    }
}

InviteMemberModal.propTypes = {
    intl: intlShape.isRequired,
    sendEmailNotifications: PropTypes.bool.isRequired,
    enableUserCreation: PropTypes.bool.isRequired,
};

export default injectIntl(InviteMemberModal);
