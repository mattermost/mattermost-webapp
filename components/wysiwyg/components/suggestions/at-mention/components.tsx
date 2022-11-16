// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {NodeViewProps} from '@tiptap/core/src/types';
import {NodeViewWrapper} from '@tiptap/react';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import React from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {displayUsername, isGuest} from 'mattermost-redux/utils/user_utils';
import styled from 'styled-components';

import {getLongDisplayNameParts, imageURLForUser} from 'utils/utils';
import {GlobalState} from 'types/store';

import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import ProfilePicture from 'components/profile_picture';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';

import {UserProfile} from '@mattermost/types/users';

const MentionItemRoot = styled.div`
    display: flex;
    flex: 1;
    gap: 8px;
    padding: 8px 20px;
    align-items: center;

    font-family: 'Open Sans', sans-serif;
    font-style: normal;
    color: rgb(var(--center-channel-color-rgb));

    .status-wrapper {
        height: auto;
    }
`;

const MentionGroupTitle = styled(MentionItemRoot)`
    padding: 6px 20px;
    opacity: 0.56;

    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    text-transform: uppercase;
`;

const UserMentionContainer = styled(MentionItemRoot)`
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
`;

const UserMentionDescription = styled.span`
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
        <UserMentionContainer
            id={user.id}
            aria-label={name}
        >
            <ProfilePicture
                src={userImageUrl}
                status={teammate?.is_bot ? undefined : status}
                size='sm'
            />
            {name}
            {description && <UserMentionDescription>{description}</UserMentionDescription>}
            <CustomStatusEmoji
                showTooltip={true}
                userID={user.id}
                emojiStyle={emojiStyle}
            />
            {tag}
        </UserMentionContainer>
    );
};

const RenderedMention = (props: NodeViewProps) => {
    console.log('###### props', props);
    const {id} = props.node.attrs;
    const teammateNameDisplay = useSelector(getTeammateNameDisplaySetting);
    const user = useSelector((state: GlobalState) => getUser(state, id));
    const name = displayUsername(user, teammateNameDisplay, true);
    return (
        <NodeViewWrapper as={'span'}>
            {'@'}{name}
        </NodeViewWrapper>
    );
};

export {
    MentionGroupTitle,
    UserMentionItem,
    RenderedMention,
};
