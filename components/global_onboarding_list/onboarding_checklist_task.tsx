// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import styled, {css} from 'styled-components';
import Icon from '@mattermost/compass-components/foundations/icon/Icon';
import { CompletedAnimation } from './onboarding_checklist_animations';

export interface TaskProps {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

const StyledTask = styled.div`
    display: flex;
    background-color: rgb(255, 255, 255);
    cursor: pointer;
    width: 100%;
    padding: 12px 20px;
    font-size: 14px;
    align-items: center;
    color: var(--center-channel-color);
    position: relative;

    &.completed {
        color: var(--denim-status-online);

        span {
            text-decoration: line-through;
        }
    }
    i {
        margin-right: 10px;
    }
    :hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }
    :active {
        background-color: rgba(var(--button-bg-rgb), 0.08);
    }
    :focus {
        box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.32),
            inset 0 0 0 2px blue;
    }
    transition: background 250ms ease-in-out, color 250ms ease-in-out,
        box-shadow 250ms ease-in-out;
`;

export const Task = (props: TaskProps): JSX.Element => {
    const {label, onClick} = props;
    const [completed, setCompleted] = useState(false);
    const handleOnClick = () => {
        if (onClick) {
            onClick();
        }
        setCompleted(true);
    }

    return (
        <StyledTask className={completed ? 'completed' : ''} onClick={handleOnClick}>
            {completed && <CompletedAnimation completed={completed}/>}
            <Icon
                glyph={completed ? 'check' : 'play'}
                size={16}
                color={completed ? 'success' : 'primary'}
            />
            <span>{label}</span>
        </StyledTask>
    );
};
