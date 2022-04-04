// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import {UserProfile} from 'mattermost-redux/types/users';

import {Channel} from 'mattermost-redux/types/channels';

import Member from './member';
import {ChannelMember} from './channel_members_rhs';

const Title = styled.div`
    font-weight: 600;
    font-size: 12px;
    line-height: 28px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    padding: 0px 12px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

const Members = styled.div`
`;

export interface Props {
    className?: string;
    channel: Channel;
    members: ChannelMember[];
    editing: boolean;
    title?: JSX.Element | null;

    actions: {
        openDirectMessage: (user: UserProfile) => void;
    };
}

const MemberList = ({className, channel, members, editing, title, actions}: Props) => {
    return (
        <div className={className} >
            {members.length > 0 && (
                <>
                    {Boolean(title) && (<Title>{title}</Title>)}
                    <Members>
                        {members.map((member, index, {length: totalUsers}) => (
                            <Member
                                key={member.user.id}
                                channel={channel}
                                index={index}
                                totalUsers={totalUsers}
                                member={member}
                                editing={editing}
                                actions={{openDirectMessage: actions.openDirectMessage}}
                            />
                        ))}
                    </Members>
                </>
            )}
        </div>
    );
};

export default styled(MemberList)`
    padding: 0 4px 16px;
`;
