// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/types/users';
import {imageURLForUser, getLongDisplayName} from 'utils/utils';
import {isGuest} from 'mattermost-redux/utils/user_utils';

import EmailIcon from 'components/widgets/icons/mail_icon';
import AlertIcon from 'components/widgets/icons/alert_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';
import Avatar from 'components/widgets/users/avatar';

import './result_table.scss';
type InviteNotSent = {
    text: React.ReactNode | React.ReactNodeArray;
}

type InviteEmail = {
    email: string;
}

type InviteUser = {
    user: UserProfile;
}

type I18nLike = {
    id: string;
    message: string;
    values?: Record<string, React.ReactNode>;
}

export type InviteResult = (InviteNotSent | InviteEmail | InviteUser) & {
    reason: string | I18nLike;
}

export type Props = {
    sent?: boolean;
    rows: InviteResult[];
}

export default function ResultTable(props: Props) {
    let wrapperClass = 'invitation-modal-confirm invitation-modal-confirm--not-sent';
    let header = (
        <h2>
            <FormattedMessage
                id='invitation_modal.confirm.not-sent-header'
                defaultMessage='Invitations Not Sent'
            />
        </h2>
    );
    if (props.sent) {
        wrapperClass = 'invitation-modal-confirm invitation-modal-confirm--sent';
        header = (
            <h2>
                <FormattedMessage
                    id='invitation_modal.confirm.sent-header'
                    defaultMessage='Successful Invites'
                />
            </h2>
        );
    }

    return (
        <div className={wrapperClass}>
            {header}
            <div className='InviteResultTable'>
                <div className='table-header'>
                    <div className='people-header'>
                        <FormattedMessage
                            id='invitation-modal.confirm.people-header'
                            defaultMessage='People'
                        />
                    </div>
                    <div className='details-header'>
                        <FormattedMessage
                            id='invitation-modal.confirm.details-header'
                            defaultMessage='Details'
                        />
                    </div>
                </div>
                <div className='rows'>
                    {props.rows.map((invitation: InviteResult) => {
                        let icon;
                        let username;
                        let className;
                        let guestBadge;
                        let botBadge;
                        let reactKey = '';

                        if (invitation.hasOwnProperty('user')) {
                            className = 'name';
                            const user = (invitation as InviteUser).user;
                            reactKey = user.id;
                            const profileImg = imageURLForUser(user.id, user.last_picture_update);
                            icon = (
                                <Avatar
                                    username={user.username}
                                    url={profileImg}
                                    size='lg'
                                />
                            );
                            username = getLongDisplayName(user);
                            if (user.is_bot) {
                                botBadge = <BotBadge/>;
                            }
                            if (isGuest(user.roles)) {
                                guestBadge = <GuestBadge/>;
                            }
                        } else if (invitation.hasOwnProperty('email')) {
                            const email = (invitation as InviteEmail).email;
                            reactKey = email;
                            className = 'email';
                            icon = <EmailIcon className='mail-icon'/>;
                            username = email;
                        } else {
                            const text = (invitation as InviteNotSent).text;
                            reactKey = typeof text === 'string' ? text : text?.toString() || 'result_table_unknown_text';
                            className = 'name';
                            icon = <AlertIcon className='alert-icon'/>;
                            username = text;
                        }

                        let reason: React.ReactNode = invitation.reason;
                        if (typeof invitation.reason !== 'string') {
                            reason = (
                                <FormattedMessage
                                    id={invitation.reason.id}
                                    defaultMessage={invitation.reason.message}
                                    values={invitation.reason.values}
                                />
                            );
                        }

                        return (
                            <div
                                key={reactKey}
                                className='InviteResultRow'
                            >
                                <div className='username-or-icon'>
                                    {icon}
                                    <span className={className}>
                                        {username}
                                        {botBadge}
                                        {guestBadge}
                                    </span>
                                </div>
                                <div className='reason'>
                                    {reason}
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
}
