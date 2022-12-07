// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {DockWindowIcon} from '@mattermost/compass-icons/components';

import Constants from 'utils/constants';

import Badge from 'components/widgets/badges/badge';

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

const MentionItemDescription = styled.span`
    opacity: 0.52;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

const EXECUTE_CURRENT_COMMAND_ITEM_ID = Constants.Integrations.EXECUTE_CURRENT_COMMAND_ITEM_ID;
const OPEN_COMMAND_IN_MODAL_ITEM_ID = Constants.Integrations.OPEN_COMMAND_IN_MODAL_ITEM_ID;
const COMMAND_SUGGESTION_ERROR = Constants.Integrations.COMMAND_SUGGESTION_ERROR;

const CommandItem = (props: AutocompleteSuggestion) => {
    const {Suggestion, Hint, Description, IconData} = props;
    const label = `${Suggestion} ${Hint}`;

    let icon;
    switch (IconData) {
    case EXECUTE_CURRENT_COMMAND_ITEM_ID:
        icon = <span className='block mt-1'>{'↵'}</span>;
        break;
    case OPEN_COMMAND_IN_MODAL_ITEM_ID:
        icon = <DockWindowIcon size={28}/>;
        break;
    case COMMAND_SUGGESTION_ERROR:
        icon = <span>{'!'}</span>;
        break;
    }
    if (IconData && ![EXECUTE_CURRENT_COMMAND_ITEM_ID, COMMAND_SUGGESTION_ERROR, OPEN_COMMAND_IN_MODAL_ITEM_ID].includes(IconData)) {
        icon = (
            <div
                className='slash-command__icon'
                style={{backgroundColor: 'transparent'}}
            >
                <img src={IconData}/>
            </div>
        );
    }

    return (
        <MentionItemRoot
            id={`${Suggestion}_${Hint}`}
            aria-label={label}
        >
            {IconData ? icon : <Badge size={'lg'}>{' / '}</Badge>}
            {label}
            {Description && (<MentionItemDescription>{Description}</MentionItemDescription>)}
        </MentionItemRoot>
    );
};

export {
    CommandItem,
};
