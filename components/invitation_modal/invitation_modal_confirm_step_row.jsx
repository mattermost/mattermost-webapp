// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {FormattedMessage} from 'react-intl';

import EmailIcon from 'components/widgets/icons/mail_icon';
import AlertIcon from 'components/widgets/icons/alert_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';
import Avatar from 'components/widgets/users/avatar';

import {imageURLForUser, isGuest, getLongDisplayName} from 'utils/utils.jsx';

import './invitation_modal_confirm_step_row.scss';

export default class InvitationModalConfirmStepRow extends React.Component {
    static propTypes = {
        invitation: PropTypes.object.isRequired,
        fixInviteRow: PropTypes.func.isRequired,
    }

    constructor() {
        super();
        this.state = {
            fixing: false,
            fixed: false,
            error: false,
        };
    }

    addUserToChannels = async () => {
        this.setState({fixing: true});
        try {
            const fixed = await this.props.fixInviteRow(this.props.invitation.user);
            this.setState({fixing: false, fixed, error: !fixed});
        } catch {
            this.setState({fixing: false, fixed: false, error: true});
        }
    }

    render() {
        const {invitation} = this.props;
        let icon;
        let username;
        let className;
        let guestBadge;
        if (invitation.user) {
            className = 'name';
            const profileImg = imageURLForUser(invitation.user.id, invitation.user.last_picture_update);
            icon = (
                <Avatar
                    username={invitation.user.username}
                    url={profileImg}
                    size='lg'
                />
            );
            username = getLongDisplayName(invitation.user);
            if (isGuest(invitation.user)) {
                guestBadge = <GuestBadge/>;
            }
        } else if (invitation.email) {
            className = 'email';
            icon = <EmailIcon className='mail-icon'/>;
            username = invitation.email;
        } else {
            className = 'name';
            icon = <AlertIcon className='alert-icon'/>;
            username = invitation.text;
        }

        let reason = invitation.reason;
        if (invitation.reason && invitation.reason.id) {
            reason = (
                <FormattedMessage
                    id={invitation.reason.id}
                    defaultMessage={invitation.reason.message}
                    values={invitation.reason.values}
                />
            );
        }

        if (invitation.fixable && invitation.belongsToTeam) {
            reason = (
                <div className='reason-with-fix'>
                    {reason}
                    {this.state.fixed &&
                        <b>
                            <FormattedMessage
                                id='invite.members.is-already-user-not-in-team.fixed'
                                defaultMessage='Added member to channels'
                            />
                        </b>}
                    {this.state.error &&
                        <b className='fix-error'>
                            <FormattedMessage
                                id='invite.members.is-already-user-not-in-team.error'
                                defaultMessage='Unable to add member to channels'
                            />
                        </b>}
                    {this.state.fixing &&
                        <a className='fixing'>
                            <FormattedMessage
                                id='invite.members.is-already-user-not-in-team.fixing'
                                defaultMessage='Adding member to channels'
                            />
                        </a>}
                    {!this.state.fixing && !this.state.fixed && !this.state.error &&
                        <a onClick={this.addUserToChannels}>
                            <FormattedMessage
                                id='invite.members.is-already-user-not-in-team.add-to-channels'
                                defaultMessage='Add this member to the channels'
                            />
                        </a>}
                </div>
            );
        } else if (invitation.fixable && !invitation.belongsToTeam) {
            reason = (
                <div className='reason-with-fix'>
                    {reason}
                    {this.state.fixed &&
                        <span className='fixed'>
                            <FormattedMessage
                                id='invite.members.is-already-user-in-team.fixed'
                                defaultMessage='Added member to team and channels'
                            />
                        </span>}
                    {this.state.error &&
                        <span className='fix-error'>
                            <FormattedMessage
                                id='invite.members.is-already-user-in-team.error'
                                defaultMessage='Unable to add member to team or channels'
                            />
                        </span>}
                    {this.state.fixing &&
                        <a className='fixing'>
                            <FormattedMessage
                                id='invite.members.is-already-user-in-team.fixing'
                                defaultMessage='Adding member to team and channels'
                            />
                        </a>}
                    {!this.state.fixing && !this.state.fixed && !this.state.error &&
                        <a onClick={this.addUserToChannels}>
                            <FormattedMessage
                                id='invite.members.is-already-user-in-team.add-to-channels'
                                defaultMessage='Add this member to the team and channels'
                            />
                        </a>}
                </div>
            );
        }

        return (
            <div className='InvitationModalConfirmStepRow'>
                <div className='username-or-icon'>
                    {icon}
                    <span className={className}>
                        {username}
                        {guestBadge}
                    </span>
                </div>
                <div className='reason'>
                    {reason}
                </div>
            </div>
        );
    }
}
