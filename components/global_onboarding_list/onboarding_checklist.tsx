// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef, useState, useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled, {css} from 'styled-components';

import Icon from '@mattermost/compass-components/foundations/icon/Icon';

import {FormattedMessage} from 'react-intl';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {trackEvent} from 'actions/telemetry_actions';
import checklistImg from 'images/onboarding-checklist.svg';
import {ModalIdentifiers, Preferences} from 'utils/constants';
import {OnBoardingTaskName} from 'components/onboarding_tasks';
import {useHandleOnBoardingTaskTrigger} from 'components/onboarding_tasks/onboarding_tasks_manager';
import {setAddChannelDropdown} from 'actions/views/add_channel_dropdown';
import {isOnBoardingTaskListOpen} from 'selectors/views/onboarding_task_list';
import {openModal} from 'actions/views/modals';
import OnBoardingVideoModal from '../onboarding_tasks/onboarding_video_modal/onboarding_video_modal';

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
    height: 566px;
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
    width: fit-content;

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
    const [open, setOpen] = useState(true);
    const [completedCount, setCompletedCount] = useState(0);
    const trigger = useRef<HTMLButtonElement>(null);
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const isToggledFromOutside = useSelector(isOnBoardingTaskListOpen);
    const handleTaskTrigger = useHandleOnBoardingTaskTrigger();

    useEffect(() => {
        if (isToggledFromOutside) {
            setOpen(isToggledFromOutside);
        }
    }, [isToggledFromOutside]);

    const startTask = (taskName: string) => {
        handleTaskTrigger(taskName);
        setCompletedCount(completedCount + 1);
        closeTaskList();
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
        {
            label: (
                <FormattedMessage
                    id='onboarding_checklist.task_channels_tour'
                    defaultMessage='Take a tour of channels'
                />),
            taskName: OnBoardingTaskName.CHANNELS_TOUR,
        },
        {
            label: (
                <FormattedMessage
                    id='onboarding_checklist.task_boards_tour'
                    defaultMessage='Manage tasks with your first board'
                />),
            taskName: OnBoardingTaskName.BOARDS_TOUR,
        },
        {
            label: (
                <FormattedMessage
                    id='onboarding_checklist.task_playbooks_tour'
                    defaultMessage='Explore workflows with your first Playbook'
                />),
            taskName: OnBoardingTaskName.PLAYBOOKS_TOUR,
        },
        {
            label: (
                <FormattedMessage
                    id='onboarding_checklist.task_invite'
                    defaultMessage='Invite team members to the workspace'
                />),
            taskName: OnBoardingTaskName.INVITE_PEOPLE,
        },
        {
            label: (
                <FormattedMessage
                    id='onboarding_checklist.task_complete_profile'
                    defaultMessage='Complete your profile'
                />),
            taskName: OnBoardingTaskName.COMPLETE_YOUR_PROFILE,
        },
        {
            label: (
                <FormattedMessage
                    id='onboarding_checklist.task_download_apps'
                    defaultMessage='Download the Desktop and Mobile Apps'
                />),
            taskName: OnBoardingTaskName.DOWNLOAD_APP,
        },
        {
            label: (
                <FormattedMessage
                    id='onboarding_checklist.task_system_console'
                    defaultMessage='Visit the System Console to configure your worksace'
                />),
            taskName: OnBoardingTaskName.VISIT_SYSTEM_CONSOLE,
        },
    ];
    const closeTaskList = useCallback(() => {
        setOpen(false);
        dispatch(setAddChannelDropdown(false));
    }, []);

    const openVideoModal = useCallback(() => {
        closeTaskList();
        dispatch(openModal({
            modalId: ModalIdentifiers.ON_BOARDING_VIDEO_MODAL,
            dialogType: OnBoardingVideoModal,
            dialogProps: {},
        }));
    }, []);

    return (
        <>
            <CompletedAnimation completed={completedCount === taskLabels.length}/>
            <Button
                onClick={() => setOpen(!open)}
                ref={trigger}
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
                            <PlayButton
                                onClick={openVideoModal}
                            >
                                <Icon
                                    glyph={'play'}
                                    size={16}
                                />
                                <FormattedMessage
                                    id='onboarding_checklist.video_title'
                                    defaultMessage='Watch overview'
                                />
                            </PlayButton>
                            {taskLabels.map((task, i) => (
                                <Task
                                    key={i}
                                    label={task.label}
                                    onClick={() => {
                                        startTask(task.taskName);
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
