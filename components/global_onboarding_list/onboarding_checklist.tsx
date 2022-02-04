// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef, useState, useCallback} from 'react';
import styled, {css} from 'styled-components';
import Icon from '@mattermost/compass-components/foundations/icon/Icon';

import checklistImg from 'images/onboarding-checklist.svg';

import {TaskListPopover} from './onboarding_checklist_popover';
import {Task} from './onboarding_checklist_task';

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

const Button = styled.button<{open: boolean}>(({open}) => {
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
        span {
            width: 15px;
            height: 12px;
            background: var(--sidebar-text-active-border);
            position: fixed;
            display: ${open ? 'none' : 'block'};
            border-radius: 12px;
            color: var(--sidebar-unread-text);
            font-weight: bold;
            font-size: 10px;
            line-height: 11px;
            margin-top: -35px;
            margin-left: 14px;
        }
    `;
});

const TaskList = (): JSX.Element => {
    const [open, setOpen] = useState(false);
    const trigger = useRef();
    const taskLabels = [
        'Take a tour of channels',
        'Manage tasks with your first board',
        'Invite team members to the workspace',
        'Complete your profile',
        'Download the Desktop and Mobile Apps',
        'Visit the System Console to configure your worksace',
    ];
    const closeMenu = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Button
                onClick={() => setOpen(!open)}
                ref={trigger}
                count={taskLabels.length}
                open={open}
            >
                <Icon glyph={open ? 'close' : 'playlist-check'}/>
                <span>{taskLabels.length}</span>
            </Button>
            <TaskListPopover
                isVisible={open}
                trigger={trigger}
                onClick={closeMenu}
            >
                <TaskItems className={open ? 'open' : ''}>
                    <h1 style={{fontSize: '20px', padding: '0 24px', marginBottom: '0'}}>
                        {'Welcome to Mattermost'}
                    </h1>
                    <p
                        style={{
                            fontSize: '12px',
                            color: 'rgba(var(--center-channel-color-rgb), 0.72)',
                            padding: '4px 24px',
                        }}
                    >
                        {"Let's get up and running."}
                    </p>
                    <img
                        src={checklistImg}
                        style={{display: 'block', margin: '1rem auto'}}
                    />
                    {taskLabels.map((label) => (
                        <Task
                            key={label}
                            label={label}
                        />
                    ))}
                    <p
                        onClick={() => {}}
                        style={{
                            fontSize: '12px',
                            color: 'var(--button-bg)',
                            padding: '0 24px',
                            fontWeight: 'bold',
                        }}
                    >
                        {'No thanks, I’ll figure it out myself'}
                    </p>
                </TaskItems>
            </TaskListPopover>
        </>
    );
};

export default TaskList;
