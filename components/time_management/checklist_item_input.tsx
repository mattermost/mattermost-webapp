// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';

import styled from 'styled-components';

import {ChecklistItem, ChecklistItemState} from './types';

import {BaseInput} from './assets/inputs';

interface ChecklistItemButtonProps {
    onChange: (item: ChecklistItemState) => void;
    item: ChecklistItem;
    disabled: boolean;
}

export const ChecklistItemButton = (props: ChecklistItemButtonProps) => {
    const isChecked = props.item.state === ChecklistItemState.Closed;

    return (
        <input
            className='checkbox'
            type='checkbox'
            checked={isChecked}
            disabled={props.disabled}
            onChange={() => {
                if (isChecked) {
                    props.onChange(ChecklistItemState.Open);
                } else {
                    props.onChange(ChecklistItemState.Closed);
                }
            }}
        />);
};

interface ChecklistItemTitleProps {
    title: string;
    setTitle: (title: string) => void;
}

const StyledBaseInput = styled(BaseInput)`
    flex: 0.5;
`;

export const ChecklistItemTitle = (props: ChecklistItemTitleProps) => {
    const {formatMessage} = useIntl();

    const [title, setTitle] = useState(props.title);

    const save = () => {
        if (title.trim().length === 0) {
            // Keep the original title from the props.
            setTitle(props.title);
            return;
        }

        props.setTitle(title);
    };

    return (
        <StyledBaseInput
            placeholder={formatMessage({defaultMessage: 'Task name'})}
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={save}
            autoFocus={!title}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                    save();
                }
            }}
        />
    );
};
