// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import InviteIcon from 'components/widgets/icons/invite_icon';
import ArrowRightIcon from 'components/widgets/icons/arrow_right_icon';

import './invitation_modal_initial_step.scss';

export default class InvitationModalInitialStep extends React.PureComponent {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
        goToMembers: PropTypes.func.isRequired,
        goToGuests: PropTypes.func.isRequired,
        emailInvitationsEnabled: PropTypes.bool.isRequired,
    }

    onMembersKeyDown = (e) => {
        const code = e.which;
        if ((code === 13) || (code === 32)) {
            this.props.goToMembers();
        }
    }

    onGuestsKeyDown = (e) => {
        const code = e.which;
        if ((code === 13) || (code === 32)) {
            this.props.goToGuests();
        }
    }

    render() {
        const teamName = this.props.teamName;
        return (
            <div className='InvitationModalInitialStep'>
                <div className='modal-icon'>
                    <InviteIcon/>
                </div>
                <h1 id='invitation_modal_title'>
                    <FormattedMarkdownMessage
                        id='invitation_modal.title'
                        defaultMessage='Invite people to **{teamName}**'
                        values={{teamName}}
                    />
                </h1>
                <div
                    className='invitation-modal-option'
                    onClick={this.props.goToMembers}
                    data-testid='inviteMembersLink'
                    tabIndex='0'
                    onKeyDown={this.onMembersKeyDown}
                    aria-labelledby='inviteMembersSectionHeader'
                    aria-describedby='inviteMembersSectionDescription'
                >
                    <div data-testid='inviteMembersSection'>
                        <h2 id='inviteMembersSectionHeader'>
                            <FormattedMarkdownMessage
                                id='invitation_modal.invite_members.title'
                                defaultMessage='Invite **Members**'
                            />
                        </h2>
                        {this.props.emailInvitationsEnabled &&
                        <FormattedMessage
                            id='invitation_modal.invite_members.description'
                            defaultMessage='Invite new team members with a link or by email. Team members have access to messages and files in open teams and public channels.'
                        >
                            {(text) => (<span id='inviteMembersSectionDescription'>{text}</span>)}
                        </FormattedMessage>
                        }
                        {!this.props.emailInvitationsEnabled &&
                        <FormattedMessage
                            id='invitation_modal.invite_members.description-email-disabled'
                            defaultMessage='Invite new team members with a link. Team members have access to messages and files in open teams and public channels.'
                        >
                            {(text) => (<span id='inviteMembersSectionDescription'>{text}</span>)}
                        </FormattedMessage>
                        }
                    </div>
                    <ArrowRightIcon className='arrow'/>
                </div>
                <div
                    className='invitation-modal-option'
                    onClick={this.props.goToGuests}
                    data-testid='inviteGuestLink'
                    tabIndex='0'
                    onKeyDown={this.onGuestsKeyDown}
                    aria-labelledby='inviteGuestsSectionHeader'
                    aria-describedby='inviteGuestsSectionDescription'
                >
                    <div>
                        <h2 id='inviteGuestsSectionHeader'>
                            <FormattedMarkdownMessage
                                id='invitation_modal.invite_guests.title'
                                defaultMessage='Invite **Guests**'
                            />
                        </h2>
                        <FormattedMessage
                            id='invitation_modal.invite_guests.description'
                            defaultMessage='Invite guests to one or more channels. Guests only have access to messages, files, and people in the channels they are members of.'
                        >
                            {(text) => (<span id='inviteGuestsSectionDescription'>{text}</span>)}
                        </FormattedMessage>
                    </div>
                    <ArrowRightIcon className='arrow'/>
                </div>
            </div>
        );
    }
}
