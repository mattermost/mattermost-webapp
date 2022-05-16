// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {CSSTransition} from 'react-transition-group';

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
    &.editing-transition-enter {
        .member-role-chooser {
            opacity: 0;
            display: block;
        }
    }

    &.editing-transition-enter-active {
        .member-role-chooser {
            opacity: 1;
            transition: opacity 250ms;
        }
    }

    &.editing-transition-enter-done {
        .member-role-chooser {
            opacity: 1;
        }
    }

    &.editing-transition-exit {
        .member-role-chooser {
            opacity: 1;
            display: block;
        }
    }

    &.editing-transition-exit-active {
        .member-role-chooser {
            opacity: 0;
            transition: opacity 250ms;
            display: block;
        }
    }
`;

export interface Props {
    className?: string;
    channel: Channel;
    members: ChannelMember[];
    editing: boolean;
    title?: JSX.Element;

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

                    <CSSTransition
                        in={editing}
                        timeout={250}
                        classNames='editing-transition'
                    >
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
                    </CSSTransition>
                </>
            )}
        </div>
    );
};

export default styled(MemberList)`
    padding: 0 4px 16px;
`;
