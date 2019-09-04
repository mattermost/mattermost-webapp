// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import InviteIcon from 'components/widgets/icons/invite_icon';
import BackIcon from 'components/widgets/icons/back_icon';
import InvitationModalConfirmStepTable from 'components/invitation_modal/invitation_modal_confirm_step_table';

import {InviteTypes} from 'utils/constants.jsx';

import './invitation_modal_confirm_step.scss';

export default class InvitationModalConfirmStep extends React.Component {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
        goBack: PropTypes.func.isRequired,
        onDone: PropTypes.func.isRequired,
        invitesType: PropTypes.oneOf([InviteTypes.INVITE_MEMBER, InviteTypes.INVITE_GUEST]).isRequired,
        invitesSent: PropTypes.array.isRequired,
        invitesNotSent: PropTypes.array.isRequired,
    }

    getInvitesCountsMessage = (invitesSentCount, invitesNotSentCount) => {
        if (invitesSentCount > 0 && invitesNotSentCount > 0) {
            return (
                <FormattedMarkdownMessage
                    id='invitation_modal.confirm.members_subtitle'
                    defaultMessage='**{sentCount, number} {sentCount, plural, one {person} other {people}}** {sentCount, plural, one {has} other {have}} been invited, and **{notSentCount, number} {notSentCount, plural, one {invitation} other {invitations}}** {notSentCount, plural, one {was} other {were}} not sent'
                    values={{sentCount: invitesSentCount, notSentCount: invitesNotSentCount}}
                />
            );
        }

        if (invitesSentCount > 0 && invitesNotSentCount === 0) {
            return (
                <FormattedMarkdownMessage
                    id='invitation_modal.confirm.members_subtitle_without_not_sent'
                    defaultMessage='**{sentCount, number} {sentCount, plural, one {person} other {people}}** {sentCount, plural, one {has} other {have}} been invited'
                    values={{sentCount: invitesSentCount}}
                />
            );
        }
        if (invitesSentCount === 0 && invitesNotSentCount > 0) {
            return (
                <FormattedMarkdownMessage
                    id='invitation_modal.confirm.members_subtitle_without_sent'
                    defaultMessage='**{notSentCount, number} {notSentCount, plural, one {invitation} other {invitations}}** {notSentCount, plural, one {was} other {were}} not sent'
                    values={{notSentCount: invitesNotSentCount}}
                />
            );
        }
        return (
            <FormattedMarkdownMessage
                id='invitation_modal.confirm.members_subtitle_without_sent_and_not_sent'
                defaultMessage='No invitation sent'
            />
        );
    }

    render() {
        const {teamName, invitesType, invitesSent, invitesNotSent, onDone} = this.props;
        return (
            <div className='InvitationModalConfirmStep'>
                {this.props.goBack &&
                    <BackIcon
                        className='back'
                        onClick={this.props.goBack}
                    />}
                <div className='modal-icon'>
                    <InviteIcon/>
                </div>
                {invitesType === InviteTypes.INVITE_MEMBER &&
                    <h1>
                        <FormattedMarkdownMessage
                            id='invitation_modal.confirm.members_title'
                            defaultMessage='**Members** Invited to **{teamName}**'
                            values={{teamName}}
                        />
                    </h1>}
                {invitesType === InviteTypes.INVITE_GUEST &&
                    <h1>
                        <FormattedMarkdownMessage
                            id='invitation_modal.confirm.guests_title'
                            defaultMessage='**Guests** Invited to **{teamName}**'
                            values={{teamName}}
                        />
                    </h1>}
                <h2 className='subtitle'>
                    {this.getInvitesCountsMessage(invitesSent.length, invitesNotSent.length)}
                </h2>
                {invitesSent.length > 0 &&
                    <div className='invitation-modal-confirm-sent'>
                        <h2>
                            <FormattedMessage
                                id='invitation_modal.confirm.sent-header'
                                defaultMessage='Successful Invites'
                            />
                        </h2>
                        <InvitationModalConfirmStepTable invites={invitesSent}/>
                    </div>}
                {invitesNotSent.length > 0 &&
                    <div className='invitation-modal-confirm-not-sent'>
                        <h2>
                            <FormattedMessage
                                id='invitation_modal.confirm.not-sent-header'
                                defaultMessage='Invitations Not Sent'
                            />
                        </h2>
                        <InvitationModalConfirmStepTable invites={invitesNotSent}/>
                    </div>}
                <div className='confirm-done'>
                    <button
                        className='btn btn-primary'
                        onClick={onDone}
                    >
                        <FormattedMessage
                            id='invitation_modal.confirm.done'
                            defaultMessage='Done'
                        />
                    </button>
                </div>
            </div>
        );
    }
}
