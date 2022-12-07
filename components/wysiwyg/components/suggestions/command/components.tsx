// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {DockWindowIcon} from '@mattermost/compass-icons/components';

import Constants from 'utils/constants';

import {AutocompleteSuggestion} from '@mattermost/types/autocomplete';

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

const MentionItemIconWrapper = styled.div`
    display: flex;
    flex: 0 0 28px;
    height: 28px;
    align-content: center;
    align-items: center;
    justify-content: center;

    font-family: 'Open Sans',sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;

    color: rgb(var(--center-channel-color-rgb));
    background: rgba(var(--center-channel-color-rgb), 0.12);
    border-radius: 4px;
`;

const MentionItemContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const MentionItemDescription = styled.span`
    opacity: 0.52;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 0.8em;
    max-width: 100%;
`;

const EXECUTE_CURRENT_COMMAND_ITEM_ID = Constants.Integrations.EXECUTE_CURRENT_COMMAND_ITEM_ID;
const OPEN_COMMAND_IN_MODAL_ITEM_ID = Constants.Integrations.OPEN_COMMAND_IN_MODAL_ITEM_ID;
const COMMAND_SUGGESTION_ERROR = Constants.Integrations.COMMAND_SUGGESTION_ERROR;

const CommandItem = (props: AutocompleteSuggestion) => {
    const {Suggestion, Hint, Description, IconData} = props;
    const label = `${Suggestion} ${Hint}`;

    let icon: React.ReactNode = '/';
    switch (IconData) {
    case EXECUTE_CURRENT_COMMAND_ITEM_ID:
        icon = '↵';
        break;
    case OPEN_COMMAND_IN_MODAL_ITEM_ID:
        icon = <DockWindowIcon size={28}/>;
        break;
    case COMMAND_SUGGESTION_ERROR:
        icon = '!';
        break;
    }
    if (IconData && ![EXECUTE_CURRENT_COMMAND_ITEM_ID, COMMAND_SUGGESTION_ERROR, OPEN_COMMAND_IN_MODAL_ITEM_ID].includes(IconData)) {
        icon = (
            <img
                src={IconData}
                alt={`icon for command ${Suggestion}`}
            />
        );
    }

    return (
        <MentionItemRoot
            id={`${Suggestion}_${Hint}`}
            aria-label={label}
        >
            <MentionItemIconWrapper>
                {icon}
            </MentionItemIconWrapper>
            <MentionItemContentWrapper>
                {label}
                {Description && (<MentionItemDescription>{Description}</MentionItemDescription>)}
            </MentionItemContentWrapper>
        </MentionItemRoot>
    );
};

export {
    CommandItem,
};
