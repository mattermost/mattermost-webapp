// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled, {css} from 'styled-components';

import {UserProfile} from 'mattermost-redux/types/users';
import ProfilePicture from 'components/profile_picture';
import {Client4} from 'mattermost-redux/client';

import {ChannelMember} from './channel_members_rhs';

const Avatar = styled.div`
`;

const DisplayName = styled.div`
    margin-left: 8px;
    font-size: 14px;
    line-height: 20px;
    color: var(--center-channel-text);
`;

const Username = styled.div`
    flex: 1;
    margin-left: 8px;
    font-size: 12px;
    line-height: 18px;
    color: rgba(var(--center-channel-text-rgb), 0.56);
`;

const SendMessage = styled.button`
    display: none;
    border: 0;
    background-color: transparent;
    padding: 0;
    width: 24px;
    height: 24px;
    &:hover {
        background-color: rgba(var(--center-channel-text-rgb), 0.12);
    }
    .icon {
        font-size: 14.4px;
        color: rgba(var(--center-channel-text-rgb), 0.56);
    };
`;

const RoleChoser = styled.div`
`;

interface Props {
    className?: string;
    member: ChannelMember;
    editing: boolean;
    actions: {
        openDirectMessage: (user: UserProfile) => void;
    };
}

const Member = ({className, member, editing, actions}: Props) => {
    return (
        <div className={className}>
            <Avatar>
                <ProfilePicture
                    isRHS={true}
                    popoverPlacement='left'
                    size='sm'
                    status={member.status}
                    userId={member.user.id}
                    username={member.displayName}
                    src={Client4.getProfilePictureUrl(member.user.id, member.user.last_picture_update)}
                />
            </Avatar>
            <DisplayName>{member.displayName}</DisplayName>
            <Username>{'@'}{member.user.username}</Username>
            {editing ? (
                <RoleChoser/>
            ) : (
                <SendMessage onClick={() => actions.openDirectMessage(member.user)}>
                    <i className='icon icon-send'/>
                </SendMessage>
            )}
        </div>
    );
};

export default styled(Member)`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 16px;
    border-radius: 4px;
    &:hover {
        background: rgba(var(--center-channel-text-rgb), 0.08);
        color: rgba(var(--center-channel-text-rgb), 0.56);
        ${() => {
        return css`
            ${SendMessage} {
                display: block;
            }
            `;
    }}
    }
`;
