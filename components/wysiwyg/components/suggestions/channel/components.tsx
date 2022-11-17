// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {GlobeIcon} from '@mattermost/compass-icons/components';

import {Channel} from '@mattermost/types/channels';

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

const ChannelSuggestionItem = (channel: Channel) => {
    const {id, display_name: displayName, name} = channel;
    return (
        <MentionItemRoot
            id={id}
            aria-label={name}
        >
            <GlobeIcon size={18}/>
            {displayName}
            <MentionItemDescription>{`@${name}`}</MentionItemDescription>
        </MentionItemRoot>
    );
};

export {
    ChannelSuggestionItem,
};
