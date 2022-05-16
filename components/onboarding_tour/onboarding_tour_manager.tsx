// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {isFirstAdmin} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'mattermost-redux/types/store';
import {savePreferences, savePreferences as storeSavePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {setAddChannelDropdown} from 'actions/views/add_channel_dropdown';
import {open as openLhs} from 'actions/views/lhs.js';
import {trackEvent as trackEventAction} from 'actions/telemetry_actions';
import {
    generateTelemetryTag,
    OnboardingTaskCategory,
    OnboardingTaskList,
    OnboardingTasksName,
} from 'components/onboarding_tasks';
import {switchToChannels} from 'actions/views/onboarding_tasks';

import {
    AutoTourStatus,
    ChannelsTour,
    FINISHED,
    OnboardingTourSteps,
    SKIPPED,
    TTNameMapToATStatusKey,
    TutorialTourName,
} from './constant';
import {getLastStep, isKeyPressed, KeyCodes} from './utils';

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
    const isUserFirstAdmin = useSelector(isFirstAdmin);
    const currentUserId = useSelector(getCurrentUserId);

    const nextStepActions = useCallback((step: number) => {
        switch (step) {
        case OnboardingTourSteps.CHANNELS_AND_DIRECT_MESSAGES : {
            dispatch(openLhs());
            break;
        }
        case OnboardingTourSteps.CREATE_AND_JOIN_CHANNELS : {
            dispatch(setAddChannelDropdown(true));
            break;
        }
        case OnboardingTourSteps.INVITE_PEOPLE : {
            dispatch(setAddChannelDropdown(true));
            break;
        }
        case OnboardingTourSteps.SEND_MESSAGE : {
            dispatch(switchToChannels());
            break;
        }
        case OnboardingTourSteps.CUSTOMIZE_EXPERIENCE : {
            break;
        }
        case OnboardingTourSteps.FINISHED: {
            let preferences = [
                {
                    user_id: currentUserId,
                    category: OnboardingTaskCategory,
                    name: OnboardingTasksName.CHANNELS_TOUR,
                    value: FINISHED.toString(),
                },
            ];
            if (isUserFirstAdmin) {
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
            break;
        }
        default:
        }
    }, [currentUserId]);

    const lastStepActions = useCallback((lastStep: number) => {
        switch (lastStep) {
        case OnboardingTourSteps.CHANNELS_AND_DIRECT_MESSAGES : {
            break;
        }
        case OnboardingTourSteps.CREATE_AND_JOIN_CHANNELS : {
            dispatch(setAddChannelDropdown(false));
            break;
        }
        case OnboardingTourSteps.INVITE_PEOPLE : {
            dispatch(setAddChannelDropdown(false));
            break;
        }
        case OnboardingTourSteps.SEND_MESSAGE : {
            break;
        }
        case OnboardingTourSteps.CUSTOMIZE_EXPERIENCE : {
            break;
        }
        default:
        }
    }, [currentUserId]);

    return useCallback((step: number, lastStep: number) => {
        lastStepActions(lastStep);
        nextStepActions(step);
    }, [nextStepActions, lastStepActions]);
};

const useOnBoardingTourTipManager = (): OnBoardingTourTipManager => {
    const [show, setShow] = useState(false);
    const tourSteps = OnboardingTourSteps;

    // Function to save the tutorial step in redux store start here which needs to be modified
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const tourCategory = TutorialTourName.ONBOARDING_TUTORIAL_STEP;
    const currentStep = useSelector((state: GlobalState) => getInt(state, tourCategory, currentUserId, 0));
    const autoTourStatus = useSelector((state: GlobalState) => getInt(state, tourCategory, TTNameMapToATStatusKey[tourCategory], 0));
    const isAutoTourEnabled = autoTourStatus === AutoTourStatus.ENABLED;
    const handleActions = useHandleNavigationAndExtraActions();

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
                const telemetryTag = generateTelemetryTag(ChannelsTour, tourCategory, eventSuffix);
                trackEventAction(tourCategory, telemetryTag);
            }
        },
        [currentUserId],
    );

    // Function to save the tutorial step in redux store end here

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
        handleActions(stepValue, currentStep);
    }, [currentStep, handleHide, handleSaveDataAndTrackEvent, handleActions]);

    const handleDismiss = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleHide();
        handleSaveDataAndTrackEvent(currentStep, 'dismiss', false);
    }, [handleSaveDataAndTrackEvent, handleHide]);

    const handlePrevious = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleSavePreferences(false);
    }, [handleSavePreferences]);

    const handleNext = useCallback((e?: React.MouseEvent): void => {
        if (e) {
            handleEventPropagationAndDefault(e);
        }
        if (getLastStep(tourSteps) === currentStep) {
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
        handleActions(SKIPPED, currentStep);
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
