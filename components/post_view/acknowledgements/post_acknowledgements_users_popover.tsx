// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import Timestamp from 'components/timestamp';
import Avatar from 'components/widgets/users/avatar';
import Nbsp from 'components/html_entities/nbsp';

import {Client4} from 'mattermost-redux/client';
import {makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import type {UserProfile} from '@mattermost/types/users';
import type {PostAcknowledgement} from '@mattermost/types/posts';

type Props = {
    currentUserId: UserProfile['id'];
    list: Array<{user: UserProfile; acknowledgedAt: PostAcknowledgement['acknowledged_at']}>;
};

const Item = styled.div`
    display: flex;
    gap: 12px;
    padding: 10px 20px;
`;

const Info = styled.div`
    display: flex;
    flex-direction: column;
`;

const Title = styled.div`
    padding: 8px 20px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
    text-transform: uppercase;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
`;

const Span = styled.span`
    color: rgba(var(--center-channel-color-rgb), 0.56);
    font-size: 12px;
    line-height: 18px;
`;

const Popover = styled.div`
    padding: 8px 0;
    background: var(--center-channel-bg);
    border-radius: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    color: lighten($black, 25%);
    font-family: inherit;
    max-height: 400px;
    overflow-y: scroll;
`;

function Row({
    acknowledgedAt,
    id,
    isMe,
    lastPictureUpdate,
    username,
}: {
    acknowledgedAt: number;
    id: UserProfile['id'];
    isMe: boolean;
    lastPictureUpdate: UserProfile['last_picture_update'];
    username: UserProfile['username'];
}) {
    const getDisplayName = useMemo(makeGetDisplayName, []);
    const displayName = useSelector((state: GlobalState) => getDisplayName(state, id));

    return (
        <Item>
            <Avatar
                size='sm'
                url={Client4.getProfilePictureUrl(id, lastPictureUpdate)}
                username={username}
            />
            <Info>
                <div>
                    {displayName}
                    {isMe && (
                        <>
                            <Nbsp/>
                            <FormattedMessage
                                id={'post_priority.you.acknowledge'}
                                defaultMessage={'(you)'}
                            />
                        </>
                    )}
                </div>
                <Span>
                    <Timestamp value={acknowledgedAt}/>
                </Span>
            </Info>
        </Item>
    );
}

export default function PostAcknowledgementsUserPopover({list, currentUserId}: Props) {
    return (
        <Popover>
            <Title>
                <FormattedMessage
                    id={'post_priority.acknowledgements.title'}
                    defaultMessage={'Acknowledgements'}
                />
            </Title>
            {list.map((item) => (
                <Row
                    key={item.user.id}
                    acknowledgedAt={item.acknowledgedAt}
                    isMe={currentUserId === item.user.id}
                    id={item.user.id}
                    lastPictureUpdate={item.user.last_picture_update}
                    username={item.user.username}
                />
            ))}
        </Popover>
    );
}
