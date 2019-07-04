// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import {isEmail} from 'mattermost-redux/utils/helpers';

import * as GlobalActions from 'actions/global_actions.jsx';
import Constants from 'utils/constants.jsx';
import * as utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';

import ConfirmModal from 'components/confirm_modal.jsx';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import LocalizedInput from 'components/localized_input/localized_input';

const holders = defineMessages({
    emailError: {
        id: t('invite_member.emailError'),
        defaultMessage: 'Please enter a valid email address',
    },
    firstname: {
        id: t('invite_member.firstname'),
        defaultMessage: 'First name',
    },
    lastname: {
        id: t('invite_member.lastname'),
        defaultMessage: 'Last name',
    },
    modalTitle: {
        id: t('invite_member.modalTitle'),
        defaultMessage: 'Discard Invitations?',
    },
    modalMessage: {
        id: t('invite_member.modalMessage'),
        defaultMessage: 'You have unsent invitations, are you sure you want to discard them?',
    },
    modalButton: {
        id: t('invite_member.modalButton'),
        defaultMessage: 'Yes, Discard',
    },
});

class InviteMemberModal extends React.PureComponent {
    static propTypes = {
        intl: intlShape.isRequired,
        enableUserCreation: PropTypes.bool.isRequired,
        currentUser: PropTypes.object.isRequired,
        defaultChannelName: PropTypes.string.isRequired,
        teamType: PropTypes.string.isRequired,
        teamId: PropTypes.string.isRequired,
        onHide: PropTypes.func.isRequired,
        actions: PropTypes.shape({
            sendEmailInvitesToTeam: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            show: true,
            inviteIds: [0],
            idCount: 0,
            emailErrors: {},
            firstNameErrors: {},
            lastNameErrors: {},
            showConfirmModal: false,
            isSendingEmails: false,
        };
    }

    onHide = () => {
        this.setState({show: false});
    }

    handleSubmit = async () => {
        const inviteIds = this.state.inviteIds;
        const count = inviteIds.length;
        const invites = [];
        const emails = [];
        const emailErrors = {...this.state.emailErrors};
        const firstNameErrors = {...this.state.firstNameErrors};
        const lastNameErrors = {...this.state.lastNameErrors};
        let valid = true;

        for (let i = 0; i < count; i++) {
            const invite = {};
            const index = inviteIds[i];
            invite.email = ReactDOM.findDOMNode(this.refs['email' + index]).value.trim();
            invite.firstName = ReactDOM.findDOMNode(this.refs['first_name' + index]).value.trim();
            invite.lastName = ReactDOM.findDOMNode(this.refs['last_name' + index]).value.trim();
            if (invite.email !== '' || index === 0) {
                if (!invite.email || !isEmail(invite.email)) {
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

        invites.forEach((i) => {
            emails.push(i.email);
        });

        this.setState({isSendingEmails: true});

        const {data, error} = await this.props.actions.sendEmailInvitesToTeam(this.props.teamId, emails);
        if (data) {
            this.handleHide(false);
            this.setState({isSendingEmails: false});
        } else if (error) {
            if (error.id === 'api.team.invite_members.already.app_error') {
                emailErrors[error.detailed_error] = error.message;
                this.setState({emailErrors});
            } else {
                this.setState({serverError: error.message});
            }

            this.setState({isSendingEmails: false});
        }
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
        const count = this.state.idCount + 1;
        const inviteIds = [...this.state.inviteIds];
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

    removeInviteFields = (inviteId) => {
        let count = this.state.idCount;
        const inviteIds = this.state.inviteIds.filter((id) => id !== inviteId);
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
        const {currentUser} = this.props;
        const {formatMessage} = this.props.intl;

        if (currentUser != null && this.props.teamType != null) {
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
                                <span
                                    className='fa fa-trash'
                                    title={formatMessage({id: 'generic_icons.remove', defaultMessage: 'Remove Icon'})}
                                />
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
                                <LocalizedInput
                                    onKeyDown={this.handleKeyDown}
                                    type='text'
                                    className='form-control'
                                    ref={'first_name' + index}
                                    placeholder={holders.firstname}
                                    maxLength='64'
                                    disabled={!this.props.enableUserCreation}
                                    spellCheck='false'
                                />
                                {firstNameError}
                            </div>
                        </div>
                        <div className='col-sm-6'>
                            <div className={lastNameClass}>
                                <LocalizedInput
                                    onKeyDown={this.handleKeyDown}
                                    type='text'
                                    className='form-control'
                                    ref={'last_name' + index}
                                    placeholder={holders.lastname}
                                    maxLength='64'
                                    disabled={!this.props.enableUserCreation}
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
                                disabled={!this.props.enableUserCreation}
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

            if (this.props.enableUserCreation) {
                content = (
                    <div>
                        {serverError}
                        <button
                            type='button'
                            className='btn btn-link'
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
                            <FormattedMarkdownMessage
                                id='invite_member.autoJoin'
                                defaultMessage='People invited automatically join the **{channel}** channel.'
                                values={{
                                    channel: this.props.defaultChannelName,
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
                if (this.state.inviteIds.length > 1) {
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
                        <LoadingWrapper
                            loading={this.state.isSendingEmails}
                            text={utils.localizeMessage('invite_member.sending', ' Sending')}
                        >
                            {sendButtonLabel}
                        </LoadingWrapper>
                    </button>
                );
            } else if (this.props.enableUserCreation) {
                var teamInviteLink = null;
                if (currentUser && this.props.teamType === 'O') {
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
                        onExited={this.props.onHide}
                        enforceFocus={!this.state.showConfirmModal}
                        backdrop={this.state.isSendingEmails ? 'static' : true}
                        role='dialog'
                        aria-labelledby='inviteMemberModalLabel'
                    >
                        <Modal.Header closeButton={!this.state.isSendingEmails}>
                            <Modal.Title
                                componentClass='h1'
                                id='inviteMemberModalLabel'
                            >
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
                                className='btn btn-link'
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

export default injectIntl(InviteMemberModal);
