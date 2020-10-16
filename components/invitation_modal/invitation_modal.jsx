// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {trackEvent, pageVisited} from 'actions/telemetry_actions.jsx';
import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import ConfirmModal from 'components/confirm_modal';
import RootPortal from 'components/root_portal';

import {InviteTypes} from 'utils/constants';

import InvitationModalInitialStep from './invitation_modal_initial_step.jsx';
import InvitationModalMembersStep from './invitation_modal_members_step';
import InvitationModalGuestsStep from './invitation_modal_guest_step';
import InvitationModalConfirmStep from './invitation_modal_confirm_step.jsx';

import './invitation_modal.scss';

const STEPS_INITIAL = 'initial';
const STEPS_INVITE_MEMBERS = 'members';
const STEPS_INVITE_GUESTS = 'guests';
const STEPS_INVITE_CONFIRM = 'confirm';

export default class InvitationModal extends React.PureComponent {
    static propTypes = {
        show: PropTypes.bool,
        currentTeam: PropTypes.object.isRequired,
        invitableChannels: PropTypes.array.isRequired,
        canInviteGuests: PropTypes.bool.isRequired,
        canAddUsers: PropTypes.bool.isRequired,
        emailInvitationsEnabled: PropTypes.bool.isRequired,
        isCloud: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            closeModal: PropTypes.func.isRequired,
            sendGuestsInvites: PropTypes.func.isRequired,
            sendMembersInvites: PropTypes.func.isRequired,
            searchProfiles: PropTypes.func.isRequired,
            searchChannels: PropTypes.func.isRequired,
            getTeam: PropTypes.func.isRequired,
        }).isRequired,
    }

    modal = React.createRef();

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

    componentDidMount() {
        if (this.props.isCloud) {
            pageVisited('cloud_invite_users', 'pageview_invite_users');
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.step === STEPS_INVITE_MEMBERS && prevState.step !== STEPS_INVITE_MEMBERS && !this.props.currentTeam.invite_id) {
            this.props.actions.getTeam(this.props.currentTeam.id);
        }
    }

    goToFirstStep = () => {
        if (this.props.canAddUsers && this.props.canInviteGuests) {
            this.goToInitialStep();
        } else if (this.props.canAddUsers) {
            this.goToMembers();
        } else if (this.props.canInviteGuests) {
            this.goToGuests();
        } else {
            this.close();
        }
    }

    goToInitialStep = () => {
        if (this.state.hasChanges) {
            this.setState({confirmBack: true});
        } else {
            this.setState({step: STEPS_INITIAL, hasChanges: false, lastInviteChannels: [], lastInviteMesssage: '', prevStep: this.state.step});
        }
        if (this.modal && this.modal.current) {
            this.modal.current.enforceFocus();
        }
    }

    goToMembers = () => {
        if (this.props.isCloud) {
            trackEvent('cloud_invite_users', 'click_invite_members');
        }
        this.setState({step: STEPS_INVITE_MEMBERS, prevStep: this.state.step, hasChanges: false, invitesSent: [], invitesNotSent: [], invitesType: InviteTypes.INVITE_MEMBER});
        if (this.modal && this.modal.current) {
            this.modal.current.enforceFocus();
        }
    }

    goToGuests = () => {
        if (this.props.isCloud) {
            trackEvent('cloud_invite_users', 'click_invite_guests');
        }
        this.setState({step: STEPS_INVITE_GUESTS, prevStep: this.state.step, hasChanges: false, invitesSent: [], invitesNotSent: [], invitesType: InviteTypes.INVITE_GUEST});
        if (this.modal && this.modal.current) {
            this.modal.current.enforceFocus();
        }
    }

    goToPrevStep = () => {
        if (this.state.prevStep === STEPS_INVITE_GUESTS) {
            this.setState({step: STEPS_INVITE_GUESTS, prevStep: this.state.step, hasChanges: false, invitesSent: [], invitesNotSent: [], invitesType: InviteTypes.INVITE_GUEST});
        } else if (this.state.prevStep === STEPS_INVITE_MEMBERS) {
            this.setState({step: STEPS_INVITE_MEMBERS, prevStep: this.state.step, hasChanges: false, invitesSent: [], invitesNotSent: [], invitesType: InviteTypes.INVITE_MEMBER});
        }
        if (this.modal && this.modal.current) {
            this.modal.current.enforceFocus();
        }
    }

    getBackFunction = () => {
        if (this.state.step === STEPS_INVITE_CONFIRM && this.state.invitesNotSent.length > 0) {
            return this.goToPrevStep;
        }
        if ((this.state.step === STEPS_INVITE_MEMBERS || this.state.step === STEPS_INVITE_GUESTS) && this.props.canInviteGuests && this.props.canAddUsers) {
            return this.goToInitialStep;
        }
        return null;
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

        if (this.props.isCloud) {
            trackEvent('cloud_invite_users', 'invitations_sent', {num_invitations_sent: invites.sent});
        }

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
                    onGoBack={this.getBackFunction()}
                    ref={this.modal}
                    ariaLabelledBy='invitation_modal_title'
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
                                emailInvitationsEnabled={this.props.emailInvitationsEnabled}
                            />
                        }
                        {this.state.step === STEPS_INVITE_MEMBERS &&
                            <InvitationModalMembersStep
                                teamName={this.props.currentTeam.display_name}
                                currentTeamId={this.props.currentTeam.id}
                                inviteId={this.props.currentTeam.invite_id}
                                searchProfiles={this.props.actions.searchProfiles}
                                emailInvitationsEnabled={this.props.emailInvitationsEnabled}
                                onSubmit={this.onMembersSubmit}
                                onEdit={this.onEdit}
                            />
                        }
                        {this.state.step === STEPS_INVITE_GUESTS &&
                            <InvitationModalGuestsStep
                                teamName={this.props.currentTeam.display_name}
                                currentTeamId={this.props.currentTeam.id}
                                myInvitableChannels={this.props.invitableChannels}
                                searchProfiles={this.props.actions.searchProfiles}
                                searchChannels={this.props.actions.searchChannels}
                                defaultChannels={this.state.lastInviteChannels}
                                defaultMessage={this.state.lastInviteMessage}
                                emailInvitationsEnabled={this.props.emailInvitationsEnabled}
                                onSubmit={this.onGuestsSubmit}
                                onEdit={this.onEdit}
                            />
                        }
                        {this.state.step === STEPS_INVITE_CONFIRM &&
                            <InvitationModalConfirmStep
                                teamName={this.props.currentTeam.display_name}
                                currentTeamId={this.props.currentTeam.id}
                                onDone={this.close}
                                onInviteMore={this.goToFirstStep}
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
