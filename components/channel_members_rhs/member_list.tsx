// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import {UserProfile} from 'mattermost-redux/types/users';

import Member from './member';
import {ChannelMember} from './channel_members_rhs';

const Title = styled.div`
    font-weight: 600;
    font-size: 12px;
    line-height: 28px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

const Members = styled.div`
`;

export interface Props {
    className?: string;
    members: ChannelMember[];
    editing: boolean;
    title?: JSX.Element;

    actions: {
        openDirectMessage: (user: UserProfile) => void;
    };
}

const MemberList = ({className, members, editing, title, actions}: Props) => {
    return (
        <div className={className} >
            {members.length > 0 && (
                <>
                    {Boolean(title) && (<Title>{title}</Title>)}
                    <Members>
                        {members.map((member) => (
                            <Member
                                key={member.user.id}
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
