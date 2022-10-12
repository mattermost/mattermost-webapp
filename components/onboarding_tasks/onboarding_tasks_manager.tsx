// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {matchPath, useLocation} from 'react-router-dom';

import {trackEvent as trackEventAction} from 'actions/telemetry_actions';
import {setProductMenuSwitcherOpen} from 'actions/views/product_menu';
import {setStatusDropdown} from 'actions/views/status_dropdown';
import {openModal} from 'actions/views/modals';
import {
    AutoTourStatus,
    FINISHED,
    OnboardingTourSteps,
    TTNameMapToATStatusKey,
    TutorialTourName,
} from 'components/onboarding_tour';
import LearnMoreTrialModal from 'components/learn_more_trial_modal/learn_more_trial_modal';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {isCurrentUserSystemAdmin, isFirstAdmin} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';
import {browserHistory} from 'utils/browser_history';
import {
    openInvitationsModal,
    setShowOnboardingCompleteProfileTour,
    setShowOnboardingVisitConsoleTour,
    switchToChannels,
} from 'actions/views/onboarding_tasks';

import {ModalIdentifiers, TELEMETRY_CATEGORIES, ExploreOtherToolsTourSteps} from 'utils/constants';

import {generateTelemetryTag} from './utils';
import {OnboardingTaskCategory, OnboardingTaskList, OnboardingTasksName, TaskNameMapToSteps} from './constants';

const getCategory = makeGetCategory();

const taskLabels = {
    [OnboardingTasksName.CHANNELS_TOUR]: (
        <FormattedMessage
            id='onboardingTask.checklist.task_learn_async_collaboration'
            defaultMessage='🗺️ Learn about async collaboration'
        />
    ),
    [OnboardingTasksName.BOARDS_TOUR]: (
        <FormattedMessage
            id='onboardingTask.checklist.plan_sprint_with_boards'
            defaultMessage='👋 Plan a sprint with Kanban-style boards OR Collaborate on projects with your team'
        />),
    [OnboardingTasksName.PLAYBOOKS_TOUR]: (
        <FormattedMessage
            id='onboardingTask.checklist.resolve_incidents_faster_with_playbooks'
            defaultMessage='🍩 Resolve incidents faster with playbooks OR Simplify your team’s processes with a playbook'
        />
    ),
    [OnboardingTasksName.INVITE_PEOPLE]: (
        <FormattedMessage
            id='onboardingTask.checklist.task_invite_people'
            defaultMessage='✔️ Enhance your Mattermost experience. Invite your team to check out our developer platform'
        />
    ),
    [OnboardingTasksName.COMPLETE_YOUR_PROFILE]: (
        <FormattedMessage
            id='onboardingTask.checklist.task_complete_profile_with_picture'
            defaultMessage='🎯 Make yourself known with a profile picture'
        />
    ),
    [OnboardingTasksName.EXPLORE_OTHER_TOOLS]: (
        <FormattedMessage
            id='onboardingTask.checklist.explore_other_tools'
            defaultMessage='⛰️ Explore other tools in the platform'
        />
    ),
    [OnboardingTasksName.DOWNLOAD_APP]: (
        <FormattedMessage
            id='onboardingTask.checklist.task_download_apps'
            defaultMessage='📅 Download the Desktop and Mobile Apps'
        />
    ),
    [OnboardingTasksName.VISIT_SYSTEM_CONSOLE]: (
        <FormattedMessage
            id='onboardingTask.checklist.task_system_console_configure'
            defaultMessage='🎯 Make System Admins happy with a configurable Mattermost server'
        />
    ),
    [OnboardingTasksName.START_TRIAL]: (
        <FormattedMessage
            id='onboardingTask.checklist.task_start_trial_explore'
            defaultMessage='⛰️ Explore how Enterprise-level high-security features make Mattermost a better option'
        />
    ),
};

export const useTasksList = () => {
    const pluginsList = useSelector((state: GlobalState) => state.plugins.plugins);
    const prevTrialLicense = useSelector((state: GlobalState) => state.entities.admin.prevTrialLicense);
    const license = useSelector(getLicense);
    const isPrevLicensed = prevTrialLicense?.IsLicensed;
    const isCurrentLicensed = license?.IsLicensed;
    const isUserAdmin = useSelector((state: GlobalState) => isCurrentUserSystemAdmin(state));
    const isUserFirstAdmin = useSelector(isFirstAdmin);

    // Cloud conditions
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const isCloud = license?.Cloud === 'true';
    const isFreeTrial = subscription?.is_free_trial === 'true';
    const hadPrevCloudTrial = subscription?.is_free_trial === 'false' && subscription?.trial_end_at > 0;

    // Show this CTA if the instance is currently not licensed and has never had a trial license loaded before
    // if Cloud, show if not in trial and had never been on trial
    const selfHostedTrialCondition = isCurrentLicensed === 'false' && isPrevLicensed === 'false';
    const cloudTrialCondition = isCloud && !isFreeTrial && !hadPrevCloudTrial;

    const showStartTrialTask = selfHostedTrialCondition || cloudTrialCondition;

    const list: Record<string, string> = {...OnboardingTasksName};
    if (!pluginsList.focalboard || !isUserFirstAdmin) {
        delete list.BOARDS_TOUR;
    }
    if (!pluginsList.playbooks || !isUserFirstAdmin) {
        delete list.PLAYBOOKS_TOUR;
    }
    if (!showStartTrialTask) {
        delete list.START_TRIAL;
    }

    if (!isUserFirstAdmin && !isUserAdmin) {
        delete list.VISIT_SYSTEM_CONSOLE;
        delete list.START_TRIAL;
    }

    // explore other tools tour is only shown to subsequent admins and end users
    if (isUserFirstAdmin || (!pluginsList.playbooks && !pluginsList.focalboard)) {
        delete list.EXPLORE_OTHER_TOOLS;
    }

    return Object.values(list);
};

export const useTasksListWithStatus = () => {
    const dataInDb = useSelector((state: GlobalState) => getCategory(state, OnboardingTaskCategory));
    const tasksList = useTasksList();
    return useMemo(() =>
        tasksList.map((task) => {
            const status = dataInDb.find((pref) => pref.name === task)?.value;
            return {
                name: task,
                status: status === FINISHED.toString(),
                label: taskLabels[task],
            };
        }), [dataInDb, tasksList]);
};

export const useHandleOnBoardingTaskData = () => {
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const storeSavePreferences = useCallback(
        (taskCategory: string, taskName, step: number) => {
            const preferences = [
                {
                    user_id: currentUserId,
                    category: taskCategory,
                    name: taskName,
                    value: step.toString(),
                },
            ];
            dispatch(savePreferences(currentUserId, preferences));
        },
        [currentUserId],
    );

    return useCallback((
        taskName: string,
        step: number,
        trackEvent = true,
        trackEventSuffix?: string,
        taskCategory = OnboardingTaskCategory,
    ) => {
        storeSavePreferences(taskCategory, taskName, step);
        if (trackEvent) {
            const eventSuffix = trackEventSuffix ? `${step}--${trackEventSuffix}` : step.toString();
            const telemetryTag = generateTelemetryTag(OnboardingTaskCategory, taskName, eventSuffix);
            trackEventAction(OnboardingTaskCategory, telemetryTag);
        }
    }, [storeSavePreferences]);
};

export const useHandleOnBoardingTaskTrigger = () => {
    const dispatch = useDispatch();
    const handleSaveData = useHandleOnBoardingTaskData();
    const currentUserId = useSelector(getCurrentUserId);
    const {pathname} = useLocation();
    const inAdminConsole = matchPath(pathname, {path: '/admin_console'}) != null;
    const inChannels = matchPath(pathname, {path: '/:team/channels/:chanelId'}) != null;

    return (taskName: string) => {
        switch (taskName) {
        case OnboardingTasksName.CHANNELS_TOUR: {
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            const tourCategory = TutorialTourName.ONBOARDING_TUTORIAL_STEP;
            const preferences = [
                {
                    user_id: currentUserId,
                    category: tourCategory,
                    name: currentUserId,
                    value: OnboardingTourSteps.CHANNELS_AND_DIRECT_MESSAGES.toString(),
                },
                {
                    user_id: currentUserId,
                    category: tourCategory,
                    name: TTNameMapToATStatusKey[tourCategory],
                    value: AutoTourStatus.ENABLED.toString(),
                },
            ];
            dispatch(savePreferences(currentUserId, preferences));
            if (!inChannels) {
                dispatch(switchToChannels());
            }
            break;
        }
        case OnboardingTasksName.BOARDS_TOUR: {
            browserHistory.push('/boards');
            localStorage.setItem(OnboardingTaskCategory, 'true');
            handleSaveData(taskName, TaskNameMapToSteps[taskName].FINISHED, true);
            break;
        }
        case OnboardingTasksName.PLAYBOOKS_TOUR: {
            browserHistory.push('/playbooks/start');
            localStorage.setItem(OnboardingTaskCategory, 'true');
            handleSaveData(taskName, TaskNameMapToSteps[taskName].FINISHED, true);
            break;
        }
        case OnboardingTasksName.COMPLETE_YOUR_PROFILE: {
            dispatch(setStatusDropdown(true));
            dispatch(setShowOnboardingCompleteProfileTour(true));
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            if (inAdminConsole) {
                dispatch(switchToChannels());
            }
            break;
        }
        case OnboardingTasksName.EXPLORE_OTHER_TOOLS: {
            dispatch(setProductMenuSwitcherOpen(true));
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            const tourCategory = TutorialTourName.EXPLORE_OTHER_TOOLS;
            const preferences = [
                {
                    user_id: currentUserId,
                    category: tourCategory,
                    name: currentUserId,
                    value: ExploreOtherToolsTourSteps.BOARDS_TOUR.toString(),
                },
                {
                    user_id: currentUserId,
                    category: tourCategory,
                    name: TTNameMapToATStatusKey[tourCategory],
                    value: AutoTourStatus.ENABLED.toString(),
                },
            ];
            dispatch(savePreferences(currentUserId, preferences));
            if (!inChannels) {
                dispatch(switchToChannels());
            }
            break;
        }
        case OnboardingTasksName.VISIT_SYSTEM_CONSOLE: {
            dispatch(setProductMenuSwitcherOpen(true));
            dispatch(setShowOnboardingVisitConsoleTour(true));
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            break;
        }
        case OnboardingTasksName.INVITE_PEOPLE: {
            localStorage.setItem(OnboardingTaskCategory, 'true');

            if (inAdminConsole) {
                dispatch(openInvitationsModal(1000));
            } else {
                dispatch(openInvitationsModal());
            }
            handleSaveData(taskName, TaskNameMapToSteps[taskName].FINISHED, true);
            break;
        }
        case OnboardingTasksName.DOWNLOAD_APP: {
            handleSaveData(taskName, TaskNameMapToSteps[taskName].FINISHED, true);
            const preferences = [{
                user_id: currentUserId,
                category: OnboardingTaskCategory,
                name: OnboardingTaskList.ONBOARDING_TASK_LIST_OPEN,
                value: 'true',
            }];
            dispatch(savePreferences(currentUserId, preferences));
            window.open('https://mattermost.com/download/', '_blank', 'noopener,noreferrer');
            break;
        }
        case OnboardingTasksName.START_TRIAL: {
            trackEventAction(
                TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_TASK_LIST,
                'open_start_trial_modal',
            );
            dispatch(openModal({
                modalId: ModalIdentifiers.LEARN_MORE_TRIAL_MODAL,
                dialogType: LearnMoreTrialModal,
            }));

            handleSaveData(taskName, TaskNameMapToSteps[taskName].FINISHED, true);
            break;
        }
        default:
        }
    };
};

