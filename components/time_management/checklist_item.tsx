// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';

import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {formatText, ChannelNamesMap} from 'utils/text_formatting';
import messageHtmlToComponent from 'utils/message_html_to_component';

import {Team} from 'mattermost-redux/types/teams';
import {GlobalState} from 'mattermost-redux/types/store';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';

import {ChecklistItem, ChecklistItemState} from './types';

import {ChecklistItemButton} from './checklist_item_input';

interface ChecklistItemDetailsProps {
    checklistItem: ChecklistItem;
    onChange?: (item: ChecklistItemState) => void;
    onRedirect?: () => void;
    disabled: boolean;
}

const ItemContainer = styled.div`
    padding-top: 1.3rem;
    :first-child {
        padding-top: 0.4rem;
    }
`;

export const CheckboxContainer = styled.div`
    align-items: flex-start;
    display: flex;
    position: relative;
    button {
        width: 53px;
        height: 29px;
        border: 1px solid #166DE0;
        box-sizing: border-box;
        border-radius: 4px;
        font-family: Open Sans;
        font-style: normal;
        font-weight: 600;
        font-size: 12px;
        line-height: 17px;
        text-align: center;
        background: #ffffff;
        color: #166DE0;
        cursor: pointer;
        margin-right: 13px;
    }
    button:disabled {
        border: 0px;
        color: var(--button-color);
        background: var(--center-channel-color-56);
        cursor: default;
    }
    &:hover {
        .checkbox-container__close {
            opacity: 1;
        }
    }
    .icon-bars {
        padding: 0 0.8rem 0 0;
    }
    input[type="checkbox"] {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 20px;
        min-width: 20px;
        height: 20px;
        background: #ffffff;
        border: 2px solid var(--center-channel-color-24);
        border-radius: 4px;
        margin: 0;
        cursor: pointer;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    input[type="checkbox"]:checked {
        background: var(--button-bg);
        border: 1px solid var(--button-bg);
        box-sizing: border-box;
    }
    input[type="checkbox"]::before {
        font-family: 'compass-icons', mattermosticons;
        text-rendering: auto;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        content: "\f12c";
        font-size: 12px;
        font-weight: bold;
        color: #ffffff;
        transition: transform 0.15s;
        transform: scale(0) rotate(90deg);
        position: relative;
    }
    input[type="checkbox"]:checked::before {
        transform: scale(1) rotate(0deg);
    }
    input[type="checkbox"]:disabled {
        opacity: 0.38;
    }
    label {
        font-weight: normal;
        word-break: break-word;
        display: inline;
        margin: 0;
        margin-right: 8px;
        flex-grow: 1;
    }
`;

const portal: HTMLElement = document.createElement('div');
document.body.appendChild(portal);

const ChecklistItemDetails = (props: ChecklistItemDetailsProps): React.ReactElement => {
    const channelNamesMap = useSelector<GlobalState, ChannelNamesMap>(getChannelsNameMapInCurrentTeam);
    const team = useSelector<GlobalState, Team>(getCurrentTeam);

    const markdownOptions = {
        singleline: true,
        mentionHighlight: false,
        atMentions: true,
        team,
        channelNamesMap,
    };

    const title = props.checklistItem.title;

    const content = (
        <>
            <ItemContainer>
                <CheckboxContainer>
                    <ChecklistItemButton
                        disabled={props.disabled}
                        item={props.checklistItem}
                        onChange={(item: ChecklistItemState) => {
                            if (props.onChange) {
                                props.onChange(item);
                            }
                        }}
                    />
                    <label title={title}>
                        <div>
                            {messageHtmlToComponent(formatText(title, markdownOptions, {}), true, {})}
                        </div>
                    </label>
                </CheckboxContainer>
            </ItemContainer>
        </>
    );

    return content;
};

export default ChecklistItemDetails;
