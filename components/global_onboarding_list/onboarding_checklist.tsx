// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef, useState, useCallback} from 'react';
import styled, {css} from 'styled-components';
import {Placement} from 'popper.js';
import Icon from '@mattermost/compass-components/foundations/icon/Icon';

import checklistImg from 'images/onboarding-checklist.svg';

import { TaskListPopover } from './onboarding_checklist_popover';
import { Task } from './onboarding_checklist_task';

export interface TaskListProps {
}

const TaskItems = styled.div`
    border-radius: 4px;
    background-color: rgba(var(--sidebar-text-rgb));
    max-width: 352px;
    padding: 1rem 0;
    transform: scale(0);
    opacity: 0;
    box-shadow: 0px 20px 32px rgba(0, 0, 0, 0.12);
    transition: opacity 300ms ease-in-out 0ms, transform 300ms ease-in-out 0ms;
    transform-origin: left bottom;
    max-height: ${document.documentElement.clientHeight}px;
    overflow-y: auto;

    &.open {
        transform: scale(1);
        opacity: 1;
    }
`;

const Button = styled.button((open: boolean) => {
    return css`
        width: 36px;
        height: 36px;
        border-radius: 50%;
        top: 90%;
        left: 3%;
        position: fixed;
        z-index: 21;
        border-color: transparent;
        display: flex;
        align-items: center;

        i {
            color: var(--sidear);
        }
        &:before {
            content: ${open ? 'X' : ''};
        }

        &:after {
            content: ${open ? 'X' : ''};
        }
    `;
});

const TaskList = (props: TaskListProps): JSX.Element => {
    const [open, setOpen] = useState(false);
    const trigger = useRef();
    const closeMenu = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Button onClick={() => setOpen(!open)} ref={trigger}>
                <Icon glyph={open ? 'close' : 'playlist-check'} />
            </Button>
            <TaskListPopover
                isVisible={open}
                trigger={trigger}
                onClick={closeMenu}
            >
                <TaskItems className={open ? 'open' : ''}>
                    <h1 style={{fontSize: '20px', padding: '0 24px'}}>
                        {' '}
                        Welcome to Mattermost
                    </h1>
                    <p
                        style={{
                            fontSize: '12px',
                            color: 'rgba(var(--center-channel-color-rgb), 0.72)',
                            padding: '0 24px',
                        }}
                    >
                        Let's get up and running.
                    </p>
                    <img
                        src={checklistImg}
                        style={{display: 'block', margin: 'auto'}}
                    />
                    <Task label='Take a tour of channels' />
                    <Task label='Manage tasks with your first board' />
                    <Task label='Invite team members to the workspace' />
                    <Task label='Complete your profile' />
                    <Task label='Download the Desktop and Mobile Apps' />
                    <Task label='Visit the System Console to configure your worksace' />
                    <p
                        style={{
                            fontSize: '12px',
                            color: 'var(--button-bg)',
                            padding: '0 24px',
                        }}
                    >
                        No thanks, I’ll figure it out myself
                    </p>
                </TaskItems>
            </TaskListPopover>
        </>
    );
};

export default TaskList;
