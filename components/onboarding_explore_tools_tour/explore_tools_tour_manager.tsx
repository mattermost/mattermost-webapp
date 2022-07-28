// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {savePreferences, savePreferences as storeSavePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {setProductMenuSwitcherOpen} from 'actions/views/product_menu';
import {trackEvent as trackEventAction} from 'actions/telemetry_actions';

import {GlobalState} from 'types/store';

import {
    generateTelemetryTag,
    OnboardingTaskCategory,
    OnboardingTaskList,
    OnboardingTasksName,
} from 'components/onboarding_tasks';

import {
    AutoTourStatus,
    OtherToolsTour,
    ExploreOtherToolsTourSteps,
    FINISHED,
    SKIPPED,
    TTNameMapToATStatusKey,
    TutorialTourName,
} from '../onboarding_tour/constant';
import {isKeyPressed, KeyCodes} from '../onboarding_tour/utils';

export type ActionType = 'next' | 'prev' | 'dismiss' | 'jump' | 'skipped'

export interface OnBoardingTourTipManager {
    show: boolean;
    currentStep: number;
    tourSteps: Record<string, number>;
    handleOpen: (e: React.MouseEvent) => void;
    handleSkip: (e: React.MouseEvent) => void;
    handleDismiss: (e: React.MouseEvent) => void;
    handlePrevious: (e: React.MouseEvent) => void;
    handleNext: (e: React.MouseEvent) => void;
    handleJump: (e: React.MouseEvent, jumpStep: number) => void;
}

const useHandleNavigationAndExtraActions = () => {
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);

    const nextStepActions = useCallback((step: number) => {
        if (step === ExploreOtherToolsTourSteps.FINISHED) {
            let preferences = [
                {
                    user_id: currentUserId,
                    category: OnboardingTaskCategory,
                    name: OnboardingTasksName.EXPLORE_OTHER_TOOLS,
                    value: FINISHED.toString(),
                },
            ];
            preferences = [...preferences,
                {
                    user_id: currentUserId,
                    category: OnboardingTaskCategory,
                    name: OnboardingTaskList.ONBOARDING_TASK_LIST_OPEN,
                    value: 'true',
                },
            ];
            dispatch(savePreferences(currentUserId, preferences));
        }
    }, [currentUserId]);

    return useCallback((step: number) => {
        nextStepActions(step);
    }, [nextStepActions]);
};

const useOnBoardingTourTipManager = (): OnBoardingTourTipManager => {
    const [show, setShow] = useState(false);
    const tourSteps = ExploreOtherToolsTourSteps;

    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const tourCategory = TutorialTourName.EXPLORE_OTHER_TOOLS;
    const currentStep = useSelector((state: GlobalState) => getInt(state, tourCategory, currentUserId, 0));
    const autoTourStatus = useSelector((state: GlobalState) => getInt(state, tourCategory, TTNameMapToATStatusKey[tourCategory], 0));
    const isAutoTourEnabled = autoTourStatus === AutoTourStatus.ENABLED;
    const handleActions = useHandleNavigationAndExtraActions();

    const pluginsList = useSelector((state: GlobalState) => state.plugins.plugins);
    const focalboard = pluginsList.focalboard;
    const playbooks = pluginsList.playbooks;

    // if both plugins are enabled, then the last step is one, otherwise if just one is enabled it must be 0
    const lastStep = (focalboard && playbooks) ? 1 : 0;

    const handleSaveDataAndTrackEvent = useCallback(
        (stepValue: number, eventSource: ActionType, autoTour = true, trackEvent = true) => {
            const preferences = [
                {
                    user_id: currentUserId,
                    category: tourCategory,
                    name: currentUserId,
                    value: stepValue.toString(),
                },
                {
                    user_id: currentUserId,
                    category: tourCategory,
                    name: TTNameMapToATStatusKey[tourCategory],
                    value: (autoTour && !(eventSource === 'skipped' || eventSource === 'dismiss') ? AutoTourStatus.ENABLED : AutoTourStatus.DISABLED).toString(),
                },
            ];
            dispatch(storeSavePreferences(currentUserId, preferences));
            if (trackEvent) {
                const eventSuffix = `${stepValue}--${eventSource}`;
                const telemetryTag = generateTelemetryTag(OtherToolsTour, tourCategory, eventSuffix);
                trackEventAction(tourCategory, telemetryTag);
            }
        },
        [currentUserId],
    );

    const handleEventPropagationAndDefault = (e: React.MouseEvent | KeyboardEvent) => {
        e.stopPropagation();
        e.preventDefault();
    };

    useEffect(() => {
        if (isAutoTourEnabled) {
            setShow(true);
        }
    }, [isAutoTourEnabled]);

    const handleHide = useCallback((): void => {
        setShow(false);
    }, []);

    const handleOpen = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        setShow(true);
    }, [isAutoTourEnabled]);

    const handleSavePreferences = useCallback((nextStep: boolean | number): void => {
        let stepValue = currentStep;
        let type: ActionType;
        if (nextStep === true) {
            stepValue += 1;
            type = 'next';
        } else if (nextStep === false) {
            stepValue -= 1;
            type = 'prev';
        } else {
            stepValue = nextStep;
            type = 'jump';
        }
        handleHide();
        handleSaveDataAndTrackEvent(stepValue, type);
        handleActions(stepValue);
    }, [currentStep, handleHide, handleSaveDataAndTrackEvent, handleActions]);

    const handleDismiss = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleHide();
        handleSaveDataAndTrackEvent(currentStep, 'dismiss', false);
        dispatch(setProductMenuSwitcherOpen(false));
    }, [handleSaveDataAndTrackEvent, handleHide]);

    const handlePrevious = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleSavePreferences(false);
    }, [handleSavePreferences]);

    const handleNext = useCallback((e?: React.MouseEvent): void => {
        if (e) {
            handleEventPropagationAndDefault(e);
        }
        if (lastStep === currentStep) {
            dispatch(setProductMenuSwitcherOpen(false));
            handleSavePreferences(FINISHED);
        } else {
            handleSavePreferences(true);
        }
    }, [handleSavePreferences]);

    const handleJump = useCallback((e: React.MouseEvent, jumpStep: number): void => {
        if (e) {
            handleEventPropagationAndDefault(e);
        }
        handleSavePreferences(jumpStep);
    }, [handleSavePreferences]);

    const handleSkip = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleHide();
        handleSaveDataAndTrackEvent(SKIPPED, 'skipped', false);
        handleActions(SKIPPED);
    }, [handleSaveDataAndTrackEvent, handleHide]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (isKeyPressed(e, KeyCodes.ENTER) && show) {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () =>
            window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, show]);

    return {
        show,
        currentStep,
        tourSteps,
        handleOpen,
        handleDismiss,
        handleNext,
        handleJump,
        handlePrevious,
        handleSkip,
    };
};

export default useOnBoardingTourTipManager;
