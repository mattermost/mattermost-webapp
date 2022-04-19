// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';

import classNames from 'classnames';

import {Client4} from 'mattermost-redux/client';
import {UserProfile} from 'mattermost-redux/types/users';
import {isGuest} from 'mattermost-redux/utils/user_utils';

import ProfilePicture from 'components/profile_picture';
import MessageIcon from 'components/widgets/icons/message_icon';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';
import SharedUserIndicator from 'components/shared_user_indicator';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';

import {UserStatuses} from 'utils/constants';

export type Props = {
    showMessageIcon: boolean;
    onItemClick: (user: UserProfile) => void;
    status: string;
    user: UserProfile;
    displayName?: string;
}

PopoverListMembersItem.defaultProps = {
    status: UserStatuses.OFFLINE,
};

export default function PopoverListMembersItem(props: Props) {
    const handleClick = () => props.onItemClick(props.user);
    const memoizedProfilePictureUrl = useMemo(() => Client4.getProfilePictureUrl(props.user.id, props.user.last_picture_update), [props.user]);

    if (!(props.user || props.displayName)) {
        return null;
    }

    const messageIcon = props.showMessageIcon ? (
        <MessageIcon aria-hidden='true'/>
    ) : null;

    const sharedIcon = props.user.remote_id ? (
        <SharedUserIndicator
            className='shared-user-icon'
            withTooltip={true}
        />
    ) : null;
    const status = props.user.is_bot ? undefined : props.status;
    const emojiStyle = {
        marginBottom: -3,
        marginLeft: 4,
    };

    return (
        <div
            data-testid='popoverListMembersItem'
            tabIndex={0}
            aria-label={props.displayName ? props.displayName.toLowerCase() : ''}
            className={classNames('more-modal__row', {botClass: props.user.is_bot})}
            onClick={handleClick}
        >
            <ProfilePicture
                src={memoizedProfilePictureUrl}
                status={status}
                size='md'
            />
            <div className='more-modal__details d-flex whitespace--nowrap'>
                <div className='more-modal__name'>
                    <span>
                        {props.displayName}
                    </span>
                    <BotBadge
                        show={Boolean(props.user.is_bot)}
                        className='badge-popoverlist'
                    />
                    <GuestBadge
                        show={isGuest(props.user.roles)}
                        className='badge-popoverlist'
                    />
                </div>
                <CustomStatusEmoji
                    userID={props.user.id}
                    showTooltip={true}
                    emojiSize={15}
                    emojiStyle={emojiStyle}
                />
                {sharedIcon}
            </div>
            <div className='more-modal__actions'>
                {messageIcon}
            </div>
        </div>
    );
}
