// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef, useState, useCallback} from 'react';
import styled, {css} from 'styled-components';
import Icon from '@mattermost/compass-components/foundations/icon/Icon';

import checklistImg from 'images/onboarding-checklist.svg';

import {TaskListPopover} from './onboarding_checklist_popover';
import {Task} from './onboarding_checklist_task';
import Completed from './onboarding_checklist_completed';
import {CompletedAnimation} from './onboarding_checklist_animations';

const TaskItems = styled.div`
    border-radius: 4px;
    border: solid 1px rgba(var(--center-channel-color-rgb), 0.16);
    background-color: var(--center-channel-bg);
    max-width: 352px;
    padding: 1rem 0;
    transform: scale(0);
    opacity: 0;
    box-shadow: 0px 20px 32px rgba(0, 0, 0, 0.12);
    transition: opacity 150ms ease-in-out 0ms, transform 150ms ease-in-out 0ms;
    transform-origin: left bottom;
    height: 518px;
    max-height: ${document.documentElement.clientHeight}px;
    overflow-y: auto;

    &.open {
        transform: scale(1);
        opacity: 1;
    }

    h1 {
        font-size: 20px;
        padding: 0 24px;
        margin: 16px 0px 0;
    }

    p {
        fontSize: 12px;
        color: rgba(var(--center-channel-color-rgb), 0.72);
        padding: 4px 24px;
    }

    .link {
        font-size: 12px;
        color: var(--link-color);
        padding: 12px 24px 0;
        font-weight: bold;
        cursor: pointer;
    }
`;

const Button = styled.button<{open: boolean}>(({open}) => {
    return css`
        width: 36px;
        height: 36px;
        border-radius: 50%;
        left: 20px;
        bottom: 20px;
        position: fixed;
        z-index: 21;
        display: flex;
        align-items: center;
        background: var(--center-channel-bg);
        border: solid 1px rgba(var(--center-channel-color-rgb), 0.16);
        box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.16);
        
        i {
            color: rgba(var(--center-channel-color-rgb), 0.56);
        }
        
        &:hover {
            border-color: rgba(var(--center-channel-color-rgb), 0.24);
            box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.16);
            
            i {
                color: rgba(var(--center-channel-color-rgb), 0.72)
            }
        }

        span {
            width: 20px;
            height: 16px;
            background: var(--sidebar-text-active-border);
            position: fixed;
            display: ${open ? 'none' : 'block'};
            border-radius: 12px;
            color: var(--button-color);
            font-weight: bold;
            font-size: 11px;
            line-height: 16px;
            margin-top: -31px;
            margin-left: 14px;
        }
    `;
});

const PlayButton = styled.button`
    padding: 10px 20px;
    background: var(--button-bg);
    border-radius: 4px;
    color: var(--sidebar-text);
    border: none;
    font-weight: bold;
    position: absolute;
    z-index: 1;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    top: 136px;

    &:hover {
        border-color: rgba(var(--center-channel-color-rgb), 0.24);
        box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.16);
    }
`;

const TaskList = (): JSX.Element => {
    const [open, setOpen] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);
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
            <CompletedAnimation completed={completedCount === taskLabels.length}/>
            <Button
                onClick={() => setOpen(!open)}
                ref={trigger}
                count={taskLabels.length}
                open={open}
            >
                <Icon glyph={open ? 'close' : 'playlist-check'}/>
                <span>{taskLabels.length - completedCount}</span>
            </Button>
            <TaskListPopover
                isVisible={open}
                trigger={trigger}
                onClick={closeMenu}
            >
                <TaskItems className={open ? 'open' : ''}>
                    {completedCount === taskLabels.length ? <Completed/> : (
                        <>
                            <h1>{'Welcome to Mattermost'}</h1>
                            <p>
                                {"Let's get up and running."}
                            </p>
                            <img
                                src={checklistImg}
                                style={{display: 'block', margin: '1rem auto', borderRadius: '4px'}}
                            />
                            <PlayButton>
                                <Icon
                                    glyph={'play'}
                                    size={16}
                                /> {'Watch overview'}
                            </PlayButton>
                            {taskLabels.map((label) => (
                                <Task
                                    key={label}
                                    label={label}
                                    onClick={() => {
                                        setCompletedCount(completedCount + 1);
                                    }}
                                />
                            ))}
                            <span
                                className='link'
                                onClick={() => {}}
                            >
                                {'No thanks, I’ll figure it out myself'}
                            </span>
                        </>
                    )}
                </TaskItems>
            </TaskListPopover>
        </>
    );
};

export default TaskList;
