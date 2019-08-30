// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import EmailIcon from 'components/widgets/icons/mail_icon';
import AlertIcon from 'components/widgets/icons/alert_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';
import Avatar from 'components/widgets/users/avatar';

import {imageURLForUser, isGuest, getLongDisplayName} from 'utils/utils.jsx';

import './invitation_modal_confirm_step_row.scss';

export default class InvitationModalConfirmStepRow extends React.Component {
    static propTypes = {
        invitation: PropTypes.object.isRequired,
    }

    render() {
        const {invitation} = this.props;
        let icon;
        let username;
        let className;
        let guestBadge;
        if (invitation.user) {
            className = 'name';
            const profileImg = imageURLForUser(invitation.user);
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
        return (
            <div className='InvitationModalConfirmStepRow'>
                <div className='username-or-icon'>
                    {icon}
                    <span className={className}>{username}</span>
                    {guestBadge}
                </div>
                <div className='reason'>
                    {invitation.reason}
                </div>
            </div>
        );
    }
}
