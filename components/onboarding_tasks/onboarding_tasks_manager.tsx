// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {savePreferences as storeSavePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {trackEvent as trackEventAction} from 'actions/telemetry_actions';
import {setProductMenuSwitcherOpen} from 'actions/views/product_menu';
import {setStatusDropdown} from 'actions/views/status_dropdown';
import {browserHistory} from 'utils/browser_history';
import {openModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import InvitationModal from 'components/invitation_modal';
import {TTCategoriesMapToAutoTourStatusKey, TutorialTourCategories} from '../tutorial_tour_tip/constant';

import {OnBoardingTaskCategory, OnBoardingTaskName, TaskNameMapToSteps} from './constant';
import {generateTelemetryTag} from './utils';

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

    const handleTask = useCallback((
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
            trackUserEvent(taskName, telemetryTag);
        }
    }, [savePreferences, trackUserEvent]);
    return handleTask;
};

export const useHandleOnBoardingTaskTrigger = () => {
    const dispatch = useDispatch();
    const handleSaveData = useHandleOnBoardingTaskData();
    const currentUserId = useSelector(getCurrentUserId);

    // const products = useSelector((state: GlobalState) => state.plugins.components.Product);

    const trigger = (taskName: string) => {
        switch (taskName) {
        case OnBoardingTaskName.CHANNELS_TOUR: {
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            const preferences = [
                {
                    user_id: currentUserId,
                    category: TutorialTourCategories.ON_BOARDING,
                    name: currentUserId,
                    value: '0',
                },
                {
                    user_id: currentUserId,
                    category: TTCategoriesMapToAutoTourStatusKey[TutorialTourCategories.ON_BOARDING],
                    name: currentUserId,
                    value: '0',
                },
            ];
            dispatch(storeSavePreferences(currentUserId, preferences));
            browserHistory.push('/');
            break;
        }
        case OnBoardingTaskName.BOARDS_TOUR: {
            browserHistory.push('/boards');
            break;
        }
        case OnBoardingTaskName.PLAYBOOKS_TOUR: {
            browserHistory.push('/playbooks');
            break;
        }
        case OnBoardingTaskName.COMPLETE_YOUR_PROFILE: {
            dispatch(setStatusDropdown(true));
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            break;
        }
        case OnBoardingTaskName.VISIT_SYSTEM_CONSOLE: {
            dispatch(setProductMenuSwitcherOpen(true));
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            break;
        }
        case OnBoardingTaskName.INVITE_PEOPLE: {
            dispatch(openModal({
                modalId: ModalIdentifiers.INVITATION,
                dialogType: InvitationModal,
                dialogProps: {
                },
            }));
            handleSaveData(taskName, TaskNameMapToSteps[taskName].FINISHED, true);
            break;
        }
        case OnBoardingTaskName.DOWNLOAD_APP: {
            break;
        }
        default:
        }
    };
    return trigger;
};
