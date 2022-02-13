// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {trackEvent as trackEventAction} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import {setProductMenuSwitcherOpen} from 'actions/views/product_menu';
import {setStatusDropdown} from 'actions/views/status_dropdown';
import InvitationModal from 'components/invitation_modal';
import {AutoTourStatus, ChannelsTour, OnBoardingTourSteps, TutorialTourName} from 'components/onboarding_tour';
import {savePreferences, savePreferences as storeSavePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';
import {browserHistory} from 'utils/browser_history';
import {ModalIdentifiers} from 'utils/constants';

import {OnBoardingTaskCategory, OnBoardingTaskList, OnBoardingTasksName, TaskNameMapToSteps} from './constants';
import {generateTelemetryTag} from './utils';

const getCategory = makeGetCategory();

const taskLabels = {
    [OnBoardingTasksName.CHANNELS_TOUR]: (
        <FormattedMessage
            id='onBoardingTask.checklist.task_channels_tour'
            defaultMessage='Take a tour of channels'
        />
    ),
    [OnBoardingTasksName.BOARDS_TOUR]: (
        <FormattedMessage
            id='onBoardingTask.checklist.task_boards_tour'
            defaultMessage='Manage tasks with your first board'
        />),
    [OnBoardingTasksName.PLAYBOOKS_TOUR]: (
        <FormattedMessage
            id='onBoardingTask.checklist.task_playbooks_tour'
            defaultMessage='Explore workflows with your first Playbook'
        />
    ),
    [OnBoardingTasksName.INVITE_PEOPLE]: (
        <FormattedMessage
            id='onBoardingTask.checklist.task_invite'
            defaultMessage='Invite team members to the workspace'
        />
    ),
    [OnBoardingTasksName.COMPLETE_YOUR_PROFILE]: (
        <FormattedMessage
            id='onBoardingTask.checklist.task_complete_profile'
            defaultMessage='Complete your profile'
        />
    ),
    [OnBoardingTasksName.DOWNLOAD_APP]: (
        <FormattedMessage
            id='onBoardingTask.checklist.task_download_apps'
            defaultMessage='Download the Desktop and Mobile Apps'
        />
    ),
    [OnBoardingTasksName.VISIT_SYSTEM_CONSOLE]: (
        <FormattedMessage
            id='onBoardingTask.checklist.task_system_console'
            defaultMessage='Visit the System Console to configure your workspace'
        />
    ),
};

export const getTasksList = () => {
    const pluginsList = useSelector((state: GlobalState) => state.plugins.plugins);
    const list: Record<string, string> = {...OnBoardingTasksName};
    if (!pluginsList.focalboard) {
        delete list.BOARDS_TOUR;
    }
    if (!pluginsList.playbooks) {
        delete list[OnBoardingTasksName.PLAYBOOKS_TOUR];
    }
    return Object.values(list);
};

export const getTasksListWithStatus = () => {
    const dataInDb = useSelector((state: GlobalState) => getCategory(state, OnBoardingTaskCategory));
    const tasksList = getTasksList();
    return tasksList.map((task) => {
        const status = dataInDb.find((pref) => pref.name === task)?.value;
        return {
            name: task,
            status: Boolean(status),
            label: taskLabels[task],
        };
    });
};

export const useHandleOnBoardingTaskData = () => {
    // Function to save the tutorial step in redux store start here which needs to be modified
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const savePreferences = useCallback(
        (taskCategory: string, taskName, step: number) => {
            const preferences = [
                {
                    user_id: currentUserId,
                    category: taskCategory,
                    name: taskName,
                    value: step.toString(),
                },
            ];
            dispatch(storeSavePreferences(currentUserId, preferences));
        },
        [currentUserId],
    );

    const trackUserEvent = useCallback((category, event, props?) => {
        trackEventAction(category, event, props);
    }, []);

    // Function to save the tutorial step in redux store end here

    return useCallback((
        taskName: string,
        step: number,
        trackEvent = true,
        trackEventSuffix?: string,
        taskCategory = OnBoardingTaskCategory,
    ) => {
        savePreferences(taskCategory, taskName, step);
        if (trackEvent) {
            const eventSuffix = trackEventSuffix ? `${step}--${trackEventSuffix}` : step.toString();
            const telemetryTag = generateTelemetryTag(OnBoardingTaskCategory, taskName, eventSuffix);
            trackUserEvent(OnBoardingTaskCategory, telemetryTag);
        }
    }, [savePreferences, trackUserEvent]);
};

export const useHandleOnBoardingTaskTrigger = () => {
    const dispatch = useDispatch();
    const handleSaveData = useHandleOnBoardingTaskData();
    const currentUserId = useSelector(getCurrentUserId);

    // const products = useSelector((state: GlobalState) => state.plugins.components.Product);

    return (taskName: string) => {
        switch (taskName) {
        case OnBoardingTasksName.CHANNELS_TOUR: {
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            const preferences = [
                {
                    user_id: currentUserId,
                    category: ChannelsTour,
                    name: TutorialTourName.ON_BOARDING_STEP,
                    value: OnBoardingTourSteps.CHANNELS_AND_DIRECT_MESSAGES.toString(),
                },
                {
                    user_id: currentUserId,
                    category: ChannelsTour,
                    name: TutorialTourName.AutoTourStatus,
                    value: AutoTourStatus.ENABLED.toString(),
                },
            ];
            dispatch(storeSavePreferences(currentUserId, preferences));
            browserHistory.push('/');
            break;
        }
        case OnBoardingTasksName.BOARDS_TOUR: {
            browserHistory.push('/boards');
            handleSaveData(taskName, TaskNameMapToSteps[taskName].FINISHED, true);
            break;
        }
        case OnBoardingTasksName.PLAYBOOKS_TOUR: {
            browserHistory.push('/playbooks');
            handleSaveData(taskName, TaskNameMapToSteps[taskName].FINISHED, true);
            break;
        }
        case OnBoardingTasksName.COMPLETE_YOUR_PROFILE: {
            dispatch(setStatusDropdown(true));
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            break;
        }
        case OnBoardingTasksName.VISIT_SYSTEM_CONSOLE: {
            dispatch(setProductMenuSwitcherOpen(true));
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            const preferences = [{
                user_id: currentUserId,
                category: OnBoardingTaskCategory,
                name: OnBoardingTaskList.ON_BOARDING_TASK_LIST_OPEN,
                value: String(!open),
            }];
            dispatch(savePreferences(currentUserId, preferences));
            break;
        }
        case OnBoardingTasksName.INVITE_PEOPLE: {
            dispatch(openModal({
                modalId: ModalIdentifiers.INVITATION,
                dialogType: InvitationModal,
                dialogProps: {
                },
            }));
            handleSaveData(taskName, TaskNameMapToSteps[taskName].FINISHED, true);
            const preferences = [{
                user_id: currentUserId,
                category: OnBoardingTaskCategory,
                name: OnBoardingTaskList.ON_BOARDING_TASK_LIST_OPEN,
                value: String(!open),
            }];
            dispatch(savePreferences(currentUserId, preferences));
            break;
        }
        case OnBoardingTasksName.DOWNLOAD_APP: {
            handleSaveData(taskName, TaskNameMapToSteps[taskName].FINISHED, true);
            const preferences = [{
                user_id: currentUserId,
                category: OnBoardingTaskCategory,
                name: OnBoardingTaskList.ON_BOARDING_TASK_LIST_OPEN,
                value: String(!open),
            }];
            dispatch(savePreferences(currentUserId, preferences));
            window.open('https://mattermost.com/download/', '_blank', 'noopener,noreferrer');
            break;
        }
        default:
        }
    };
};

