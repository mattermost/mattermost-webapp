// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef, useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled, {css} from 'styled-components';

import Icon from '@mattermost/compass-components/foundations/icon/Icon';

import {FormattedMessage} from 'react-intl';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {trackEvent} from 'actions/telemetry_actions';
import checklistImg from 'images/onboarding-checklist.svg';
import {Preferences} from 'utils/constants';

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
    min-height: 518px;
    max-height: ${document.documentElement.clientHeight}px;
    overflow-y: auto;

    &.open {
        transform: scale(1);
        opacity: 1;
    }

    h1 {
        font-size: 20px;
        padding: 0 24px;
        margin: 16px 0 0;
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
        display: block;
    }
`;

const Button = styled.button<{open: boolean}>(({open}) => {
    return css`
        width: 36px;
        height: 36px;
        padding: 7px;
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
            bottom: 47px;
            left: 41px;
        }
    `;
});

const PlayButton = styled.button`
    padding: 10px 20px;
    max-width: 175px;
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

    i {
        margin-right: 10px;
        vertical-align: middle;
    }
`;

const Skeleton = styled.div`
    width: 304px;
    height: 137px;
    margin: auto;
`;

const TaskList = (): JSX.Element => {
    const [open, setOpen] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);
    const trigger = useRef();
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);

    const completeTask = () => {
        //TODO: this will be implemented fully when we have all the Preferences for the tours merged.
        setCompletedCount(completedCount + 1);
        trackEvent('ui', 'onboarding_checklist_task_completed');
    };

    const dismissChecklist = useCallback(() => {
        const preferences = [{
            user_id: currentUserId,
            category: Preferences.DISMISS_ONBOARDING_CHECKLIST,
            name: currentUserId,
            value: 'true',
        }];
        dispatch(savePreferences(currentUserId, preferences));
        trackEvent('ui', 'onboarding_checklist_dismissed');
    }, [currentUserId]);

    const taskLabels = [
        <FormattedMessage
            key={1}
            id='onboarding_checklist.task_channels_tour'
            defaultMessage='Take a tour of channels'
        />,
        <FormattedMessage
            key={2}
            id='onboarding_checklist.task_boards_tour'
            defaultMessage='Manage tasks with your first board'
        />,
        <FormattedMessage
            key={3}
            id='onboarding_checklist.task_invite'
            defaultMessage='Invite team members to the workspace'
        />,
        <FormattedMessage
            key={4}
            id='onboarding_checklist.task_complete_profile'
            defaultMessage='Complete your profile'
        />,
        <FormattedMessage
            key={5}
            id='onboarding_checklist.task_download_apps'
            defaultMessage='Download the Desktop and Mobile Apps'
        />,
        <FormattedMessage
            key={6}
            id='onboarding_checklist.task_system_console'
            defaultMessage='Visit the System Console to configure your workspace'
        />,
    ];
    const closeTaskList = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <CompletedAnimation completed={completedCount === taskLabels.length}/>
            <Button
                onClick={() => setOpen(!open)}
                ref={trigger as unknown as React.RefObject<HTMLButtonElement>}
                open={open}
            >
                <Icon glyph={open ? 'close' : 'playlist-check'}/>
                <span>{taskLabels.length - completedCount}</span>
            </Button>
            <TaskListPopover
                isVisible={open}
                trigger={trigger}
                onClick={closeTaskList}
            >
                <TaskItems className={open ? 'open' : ''}>
                    {completedCount === taskLabels.length ? <Completed dismissAction={dismissChecklist}/> : (
                        <>
                            <h1>
                                <FormattedMessage
                                    id='next_steps_view.welcomeToMattermost'
                                    defaultMessage='Welcome to Mattermost'
                                />
                            </h1>
                            <p>
                                <FormattedMessage
                                    id='onboarding_checklist.main_subtitle'
                                    defaultMessage="Let's get up and running."
                                />
                            </p>
                            <Skeleton>
                                <img
                                    src={checklistImg}
                                    style={{display: 'block', margin: '1rem auto', borderRadius: '4px'}}
                                />
                            </Skeleton>
                            <PlayButton>
                                <Icon
                                    glyph={'play'}
                                    size={16}
                                />
                                <FormattedMessage
                                    id='onboarding_checklist.video_title'
                                    defaultMessage='Watch overview'
                                />
                            </PlayButton>
                            {taskLabels.map((label, i) => (
                                <Task
                                    key={i}
                                    label={label}
                                    onClick={() => {
                                        completeTask();
                                    }}
                                />
                            ))}
                            <span
                                className='link'
                                onClick={dismissChecklist}
                            >
                                <FormattedMessage
                                    id='onboarding_checklist.dismiss_link'
                                    defaultMessage='No thanks, I’ll figure it out myself'
                                />
                            </span>
                        </>
                    )}
                </TaskItems>
            </TaskListPopover>
        </>
    );
};

export default TaskList;
