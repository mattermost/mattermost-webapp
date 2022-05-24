// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import {Client4} from 'mattermost-redux/client';
import {UserProfile} from '@mattermost/types/users';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

import {isGuest} from 'mattermost-redux/utils/user_utils';
import {displayEntireNameForUser} from 'utils/utils';
import ProfilePicture from 'components/profile_picture';
import AddIcon from 'components/widgets/icons/fa_add_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';
import {Value} from 'components/multiselect/multiselect';

type UserProfileValue = Value & UserProfile;

type Props = {
    option: UserProfileValue;
    onAdd: (user: UserProfileValue) => void;
    onMouseMove: (user: UserProfileValue) => void;
    userStatuses: RelationOneToOne<UserProfile, string>;
    isSelected: boolean;
}

const MultiSelectOption = React.forwardRef(({
    option,
    onAdd,
    onMouseMove,
    userStatuses,
    isSelected,
}: Props, ref?: React.Ref<HTMLDivElement>) => {
    return (
        <div
            key={option.id}
            className={classNames('more-modal__row clickable', {'more-modal__row--selected': isSelected})}
            onClick={() => onAdd(option)}
            ref={ref}
            onMouseMove={() => onMouseMove(option)}
        >
            <ProfilePicture
                src={Client4.getProfilePictureUrl(option.id, option.last_picture_update)}
                status={userStatuses[option.id]}
                size='md'
                username={option.username}
            />
            <div className='more-modal__details'>
                <div className='more-modal__name'>
                    {displayEntireNameForUser(option)}
                    <BotBadge
                        show={Boolean(option.is_bot)}
                        className='badge-popoverlist'
                    />
                    <GuestBadge
                        show={isGuest(option.roles)}
                        className='popoverlist'
                    />
                </div>
            </div>
            <div className='more-modal__actions'>
                <div className='more-modal__actions--round'>
                    <AddIcon/>
                </div>
            </div>
        </div>
    );
});

export default MultiSelectOption;
