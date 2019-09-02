// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, intlShape} from 'react-intl';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import ConfirmModal from 'components/confirm_modal.jsx';
import RootPortal from 'components/root_portal';

import {InviteTypes} from 'utils/constants.jsx';

import InvitationModalInitialStep from './invitation_modal_initial_step.jsx';
import InvitationModalMembersStep from './invitation_modal_members_step.jsx';
import InvitationModalGuestsStep from './invitation_modal_guests_step.jsx';
import InvitationModalConfirmStep from './invitation_modal_confirm_step.jsx';

import './invitation_modal.scss';

const STEPS_INITIAL = 'initial';
const STEPS_INVITE_MEMBERS = 'members';
const STEPS_INVITE_GUESTS = 'guests';
const STEPS_INVITE_CONFIRM = 'confirm';

export default class InvitationModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        currentTeam: PropTypes.object.isRequired,
        invitableChannels: PropTypes.array.isRequired,
        canInviteGuests: PropTypes.bool.isRequired,
        canAddUsers: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            closeModal: PropTypes.func.isRequired,
            sendGuestsInvites: PropTypes.func.isRequired,
            sendMembersInvites: PropTypes.func.isRequired,
            searchProfiles: PropTypes.func.isRequired,
        }).isRequired,
    }

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);
        let step = STEPS_INITIAL;
        if (!props.canInviteGuests) {
            step = STEPS_INVITE_MEMBERS;
        }

        if (!props.canAddUsers) {
            step = STEPS_INVITE_GUESTS;
        }

        this.state = {
            step,
            prevStep: null,
            lastInviteChannels: [],
            lastInviteMessage: '',
            confirmModal: false,
            confirmBack: false,
            hasChanges: false,
            invitesType: InviteTypes.INVITE_MEMBER,
            invitesSent: [],
            invitesNotSent: [],
        };
    }

    goToInitialStep = () => {
        if (this.state.hasChanges) {
            this.setState({confirmBack: true});
        } else {
            this.setState({step: STEPS_INITIAL, hasChanges: false, lastInviteChannels: [], lastInviteMesssage: '', prevStep: this.state.step});
        }
    }

    goToMembers = () => {
        this.setState({step: STEPS_INVITE_MEMBERS, prevStep: this.state.step, hasChanges: false, invitesSent: [], invitesNotSent: [], invitesType: InviteTypes.INVITE_MEMBER});
    }

    goToGuests = () => {
        this.setState({step: STEPS_INVITE_GUESTS, prevStep: this.state.step, hasChanges: false, invitesSent: [], invitesNotSent: [], invitesType: InviteTypes.INVITE_GUEST});
    }

    goToPrevStep = () => {
        if (this.state.prevStep === STEPS_INVITE_GUESTS) {
            this.setState({step: STEPS_INVITE_GUESTS, prevStep: this.state.step, hasChanges: false, invitesSent: [], invitesNotSent: [], invitesType: InviteTypes.INVITE_GUEST});
        } else if (this.state.prevStep === STEPS_INVITE_MEMBERS) {
            this.setState({step: STEPS_INVITE_MEMBERS, prevStep: this.state.step, hasChanges: false, invitesSent: [], invitesNotSent: [], invitesType: InviteTypes.INVITE_MEMBER});
        }
    }

    onEdit = (hasChanges) => {
        this.setState({hasChanges});
    }

    close = () => {
        if (this.state.hasChanges) {
            this.setState({confirmModal: true});
        } else {
            this.props.actions.closeModal();
        }
    }

    confirmBack = () => {
        this.setState({step: STEPS_INITIAL, hasChanges: false, confirmBack: false});
    }

    cancelBack= () => {
        this.setState({confirmBack: false});
    }

    confirmClose = () => {
        this.props.actions.closeModal();
        this.setState({confirmModal: false});
    }

    cancelClose = () => {
        this.setState({confirmModal: false});
    }

    onMembersSubmit = async (users, emails, extraText) => {
        const invites = await this.props.actions.sendMembersInvites(this.props.currentTeam.id, users, emails);

        if (extraText !== '') {
            invites.notSent.push({
                text: extraText,
                reason: (
                    <FormattedMessage
                        id='invitation-modal.confirm.not-valid-user-or-email'
                        defaultMessage='Does not match a valid user or email.'
                    />
                ),
            });
        }

        this.setState({step: STEPS_INVITE_CONFIRM, prevStep: this.state.step, invitesSent: invites.sent, invitesNotSent: invites.notSent, invitesType: InviteTypes.INVITE_MEMBER, hasChanges: false});
    }

    onGuestsSubmit = async (users, emails, channels, message, extraUserText, extraChannelText) => {
        const invites = await this.props.actions.sendGuestsInvites(
            this.props.currentTeam.id,
            channels.map((c) => c.id),
            users,
            emails,
            message,
        );
        if (extraUserText !== '') {
            invites.notSent.push({
                text: extraUserText,
                reason: (
                    <FormattedMessage
                        id='invitation-modal.confirm.not-valid-user-or-email'
                        defaultMessage='Does not match a valid user or email.'
                    />
                ),
            });
        }
        if (extraChannelText !== '') {
            invites.notSent.push({
                text: extraChannelText,
                reason: (
                    <FormattedMessage
                        id='invitation-modal.confirm.not-valid-channel'
                        defaultMessage='Does not match a valid channel name.'
                    />
                ),
            });
        }
        this.setState({step: STEPS_INVITE_CONFIRM, prevStep: this.state.step, lastInviteChannels: channels, lastInviteMessage: message, invitesSent: invites.sent, invitesNotSent: invites.notSent, invitesType: InviteTypes.INVITE_GUEST, hasChanges: false});
    }

    render() {
        return (
            <RootPortal>
                <FullScreenModal
                    show={Boolean(this.props.show)}
                    onClose={this.close}
                >
                    <div
                        data-testid='invitationModal'
                        className='InvitationModal'
                    >
                        <ConfirmModal
                            show={this.state.confirmModal || this.state.confirmBack}
                            title={
                                <FormattedMessage
                                    id='invitation-modal.discard-changes.title'
                                    defaultMessage='Discard Changes'
                                />
                            }
                            message={
                                <FormattedMessage
                                    id='invitation-modal.discard-changes.message'
                                    defaultMessage='You have unsent invitations, are you sure you want to discard them?'
                                />
                            }
                            confirmButtonText={
                                <FormattedMessage
                                    id='invitation-modal.discard-changes.button'
                                    defaultMessage='Yes, Discard'
                                />
                            }
                            modalClass='invitation-modal-confirm'
                            onConfirm={this.state.confirmModal ? this.confirmClose : this.confirmBack}
                            onCancel={this.state.confirmModal ? this.cancelClose : this.cancelBack}
                        />
                        {this.state.step === STEPS_INITIAL &&
                            <InvitationModalInitialStep
                                teamName={this.props.currentTeam.display_name}
                                goToMembers={this.goToMembers}
                                goToGuests={this.goToGuests}
                            />
                        }
                        {this.state.step === STEPS_INVITE_MEMBERS &&
                            <InvitationModalMembersStep
                                inviteId={this.props.currentTeam.invite_id}
                                goBack={(this.props.canInviteGuests && this.props.canAddUsers && this.goToInitialStep) || null}
                                searchProfiles={this.props.actions.searchProfiles}
                                onSubmit={this.onMembersSubmit}
                                onEdit={this.onEdit}
                            />
                        }
                        {this.state.step === STEPS_INVITE_GUESTS &&
                            <InvitationModalGuestsStep
                                goBack={(this.props.canInviteGuests && this.props.canAddUsers && this.goToInitialStep) || null}
                                currentTeamId={this.props.currentTeam.id}
                                myInvitableChannels={this.props.invitableChannels}
                                searchProfiles={this.props.actions.searchProfiles}
                                defaultChannels={this.state.lastInviteChannels}
                                defaultMessage={this.state.lastInviteMessage}
                                onSubmit={this.onGuestsSubmit}
                                onEdit={this.onEdit}
                            />
                        }
                        {this.state.step === STEPS_INVITE_CONFIRM &&
                            <InvitationModalConfirmStep
                                teamName={this.props.currentTeam.display_name}
                                currentTeamId={this.props.currentTeam.id}
                                goBack={this.goToPrevStep}
                                onDone={this.close}
                                invitesType={this.state.invitesType}
                                invitesSent={this.state.invitesSent}
                                invitesNotSent={this.state.invitesNotSent}
                            />
                        }
                    </div>
                </FullScreenModal>
            </RootPortal>
        );
    }
}
