// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import EmailIcon from 'components/svg/mail_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';

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
        let guestBadge;
        if (invitation.user) {
            const profileImg = imageURLForUser(invitation.user);
            icon = (
                <img
                    className='avatar'
                    alt={`${invitation.user.username || 'user'} profile image`}
                    src={profileImg}
                />
            );
            username = getLongDisplayName(invitation.user);
            if (isGuest(invitation.user)) {
                guestBadge = <GuestBadge/>;
            }
        } else {
            icon = <EmailIcon className='mail-icon'/>;
            username = invitation.email;
        }
        return (
            <div className='InvitationModalConfirmStepRow'>
                <div className='username-or-icon'>
                    {icon}
                    <span className='name'>{username}</span>
                    {guestBadge}
                </div>
                <div className='reason'>
                    {invitation.reason}
                </div>
            </div>
        );
    }
}
