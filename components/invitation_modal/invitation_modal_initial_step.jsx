// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import InviteIcon from 'components/widgets/icons/invite_icon';
import ArrowRightIcon from 'components/widgets/icons/arrow_right_icon';

import './invitation_modal_initial_step.scss';

export default class InvitationModalInitialStep extends React.Component {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
        goToMembers: PropTypes.func.isRequired,
        goToGuests: PropTypes.func.isRequired,
    }

    render() {
        const teamName = this.props.teamName;
        return (
            <div className='InvitationModalInitialStep'>
                <div className='modal-icon'>
                    <InviteIcon/>
                </div>
                <h1>
                    <FormattedMarkdownMessage
                        id='invitation_modal.title'
                        defaultMessage='Invite people to **{teamName}**'
                        values={{teamName}}
                    />
                </h1>
                <div
                    className='invitation-modal-option'
                    onClick={this.props.goToMembers}
                >
                    <div>
                        <h2>
                            <FormattedMarkdownMessage
                                id='invitation_modal.invite_members.title'
                                defaultMessage='Invite **Members**'
                            />
                        </h2>
                        <FormattedMessage
                            id='invitation_modal.invite_members.description'
                            defaultMessage='Invite new team members with a link or by email. Team members have access to messages and files in open teams and public channels.'
                        />
                    </div>
                    <ArrowRightIcon className='arrow'/>
                </div>
                <div
                    className='invitation-modal-option'
                    onClick={this.props.goToGuests}
                >
                    <div>
                        <h2>
                            <FormattedMarkdownMessage
                                id='invitation_modal.invite_guests.title'
                                defaultMessage='Invite **Guests**'
                            />
                        </h2>
                        <FormattedMessage
                            id='invitation_modal.invite_guests.description'
                            defaultMessage='Invite guests to one or more channels. Guests only have access to messages, files, and people in the channels they are members of.'
                        />
                    </div>
                    <ArrowRightIcon className='arrow'/>
                </div>
            </div>
        );
    }
}
