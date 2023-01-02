// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AccountMultipleOutlineIcon} from '@mattermost/compass-icons/components';
import React from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getStatusForUserId} from 'mattermost-redux/selectors/entities/users';
import {isGuest} from 'mattermost-redux/utils/user_utils';
import styled from 'styled-components';

import {getLongDisplayNameParts, imageURLForUser} from 'utils/utils';
import {GlobalState} from 'types/store';

import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import ProfilePicture from 'components/profile_picture';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';

import {Group} from '@mattermost/types/groups';

import {UserProfile} from '@mattermost/types/users';

const MentionItemRoot = styled.div`
    display: flex;
    flex: 1;
    gap: 8px;
    padding: 8px 20px;
    align-items: center;

    font-family: 'Open Sans', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;

    color: rgb(var(--center-channel-color-rgb));

    > svg:first-child {
        margin: 3px;
        opacity: 0.56;
    }

    &:hover svg:first-child {
        opacity: 0.72;
    }

    .status-wrapper {
        height: auto;
    }
`;

const MentionItemDescription = styled.span`
    opacity: 0.52;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

const UserMentionItem = (user: UserProfile) => {
    const {formatMessage} = useIntl();

    const currentUserId = useSelector(getCurrentUserId);
    const status = useSelector((state: GlobalState) => getStatusForUserId(state, user.id));
    const teammate = useSelector((state: GlobalState) => getDirectTeammate(state, user.id));
    const {displayName, fullName, nickname} = getLongDisplayNameParts(user);

    let name = displayName;

    if (user.id === currentUserId) {
        name += ` ${formatMessage({id: 'suggestion.user.isCurrent', defaultMessage: '(you)'})}`;
    }

    let description = fullName ?? '';

    if (nickname) {
        description += ` (${nickname})`;
    }

    if (user.delete_at) {
        description += ` - ${formatMessage({id: 'channel_switch_modal.deactivated', defaultMessage: 'Deactivated'})}`;
    }

    const tag = (
        <>
            <BotBadge
                show={Boolean(teammate?.is_bot)}
                className='badge-autocomplete'
            />
            <GuestBadge
                show={Boolean(teammate && isGuest(teammate.roles))}
                className='badge-autocomplete'
            />
        </>
    );

    const userImageUrl = imageURLForUser(user.id, user.last_picture_update);

    const emojiStyle = {
        marginBottom: 2,
    };

    return (
        <MentionItemRoot
            id={user.id}
            aria-label={name}
        >
            <ProfilePicture
                src={userImageUrl}
                status={teammate?.is_bot ? undefined : status}
                size='sm'
            />
            {name}
            {description && <MentionItemDescription>{description}</MentionItemDescription>}
            <CustomStatusEmoji
                showTooltip={true}
                userID={user.id}
                emojiStyle={emojiStyle}
            />
            {tag}
        </MentionItemRoot>
    );
};

const GroupMentionItem = (group: Group) => {
    const {id, description, name} = group;
    return (
        <MentionItemRoot
            id={id}
            aria-label={name}
        >
            <AccountMultipleOutlineIcon size={18}/>
            {`@${name}`}
            <MentionItemDescription>{description}</MentionItemDescription>
        </MentionItemRoot>
    );
};

const SpecialMentionItem = ({name}: {name: string}) => {
    const {formatMessage} = useIntl();
    const description = formatMessage({id: `suggestion.mention.${name}`});
    return (
        <MentionItemRoot
            id={`${name}_mention-item`}
            aria-label={name}
        >
            <AccountMultipleOutlineIcon size={18}/>
            {`@${name}`}
            <MentionItemDescription>{description}</MentionItemDescription>
        </MentionItemRoot>
    );
};

export {
    UserMentionItem,
    GroupMentionItem,
    SpecialMentionItem,
};
