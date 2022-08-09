// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {Action} from 'mattermost-redux/types/actions';
import {savePreferences, savePreferences as storeSavePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {setAddChannelDropdown} from 'actions/views/add_channel_dropdown';
import {open as openLhs} from 'actions/views/lhs.js';
import {setProductMenuSwitcherOpen} from 'actions/views/product_menu';
import {trackEvent as trackEventAction} from 'actions/telemetry_actions';

import {GlobalState} from '@mattermost/types/store';
import {getPlugins} from 'selectors/plugins';

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
    OtherToolsTour,
    ExploreOtherToolsTourSteps,
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

function finishTourAndOpenOnboardingTaskList(currentUserId: string, onboardingTaskName: string, dispatch: (action: Action) => void) {
    let preferences = [
        {
            user_id: currentUserId,
            category: OnboardingTaskCategory,
            name: onboardingTaskName,
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

function makeOnboardingNextStepActions(currentUserId: string, dispatch: (action: Action) => void) {
    return {
        [OnboardingTourSteps.CHANNELS_AND_DIRECT_MESSAGES]: () => {
            dispatch(openLhs());
        },
        [OnboardingTourSteps.CREATE_AND_JOIN_CHANNELS]: () => {
            dispatch(setAddChannelDropdown(true));
        },
        [OnboardingTourSteps.INVITE_PEOPLE]: () => {
            dispatch(setAddChannelDropdown(true));
        },
        [OnboardingTourSteps.SEND_MESSAGE]: () => {
            dispatch(switchToChannels());
        },
        [OnboardingTourSteps.CUSTOMIZE_EXPERIENCE]: () => {
        },
        [OnboardingTourSteps.FINISHED]: () => {
            finishTourAndOpenOnboardingTaskList(currentUserId, OnboardingTasksName.EXPLORE_OTHER_TOOLS, dispatch);
        },
    };
}

function makeOnboardingLastStepActions(dispatch: (action: Action) => void) {
    return {
        [OnboardingTourSteps.CHANNELS_AND_DIRECT_MESSAGES]: () => {
        },
        [OnboardingTourSteps.CREATE_AND_JOIN_CHANNELS]: () => {
            dispatch(setAddChannelDropdown(false));
        },
        [OnboardingTourSteps.INVITE_PEOPLE]: () => {
            dispatch(setAddChannelDropdown(false));
        },
        [OnboardingTourSteps.SEND_MESSAGE]: () => {
        },
        [OnboardingTourSteps.CUSTOMIZE_EXPERIENCE]: () => {
        },
    };
}

function makeOtherToolsNextStepActions(currentUserId: string, dispatch: (action: Action) => void) {
    return {
        [ExploreOtherToolsTourSteps.FINISHED]: () => {
            finishTourAndOpenOnboardingTaskList(currentUserId, OnboardingTasksName.EXPLORE_OTHER_TOOLS, dispatch);
        },
    };
}

interface MakeActionsDeps {
    tourName: string;
    dispatch: (action: Action) => void;
    currentUserId: string;
}

type TourActions = Record<number, () => void>

function useMakeActions({tourName, dispatch, currentUserId}: MakeActionsDeps): {nextStepActions: TourActions; lastStepActions: TourActions} {
    let actions = {
        nextStepActions: {},
        lastStepActions: {},
    };
    if (tourName === TutorialTourName.EXPLORE_OTHER_TOOLS) {
        actions = {
            lastStepActions: {},
            nextStepActions: makeOtherToolsNextStepActions(currentUserId, dispatch),
        };
    } else if (tourName === TutorialTourName.ONBOARDING_TUTORIAL_STEP) {
        actions = {
            nextStepActions: makeOnboardingNextStepActions(currentUserId, dispatch),
            lastStepActions: makeOnboardingLastStepActions(dispatch),
        };
    } else {
        throw new Error(`Unsupported usage of useHandleNavigationAndExtraActions. Please add ${tourName} as a handled type of tour.`);
    }
    return useMemo(() => actions, [tourName, dispatch, currentUserId]);
}

const useHandleNavigationAndExtraActions = (tourName: string) => {
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);

    const {nextStepActions, lastStepActions} = useMakeActions({dispatch, currentUserId, tourName});

    return useCallback((step: number, lastStep: number) => {
        lastStepActions[lastStep]?.();
        nextStepActions[step]?.();
    }, [nextStepActions, lastStepActions]);
};

const trackingCategoriesByTourName = {
    [TutorialTourName.ONBOARDING_TUTORIAL_STEP]: ChannelsTour,
    [TutorialTourName.EXPLORE_OTHER_TOOLS]: OtherToolsTour,
};

function useGetOtherToolsLastStep(): number {
    const pluginsList = useSelector(getPlugins);
    const focalboard = pluginsList?.focalboard;
    const playbooks = pluginsList?.playbooks;

    // if both plugins are enabled, then the last step is one, otherwise if just one is enabled it must be 0
    return useMemo(() => ((focalboard && playbooks) ? 1 : 0), [focalboard, playbooks]);
}

const useOnBoardingTourTipManager = (tourCategory: typeof TutorialTourName['ONBOARDING_TUTORIAL_STEP'] | typeof TutorialTourName['EXPLORE_OTHER_TOOLS']): OnBoardingTourTipManager => {
    const [show, setShow] = useState(false);
    const tourSteps = OnboardingTourSteps;

    // Function to save the tutorial step in redux store start here which needs to be modified
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const currentStep = useSelector((state: GlobalState) => getInt(state, tourCategory, currentUserId, 0));
    const autoTourStatus = useSelector((state: GlobalState) => getInt(state, tourCategory, TTNameMapToATStatusKey[tourCategory], 0));
    const isAutoTourEnabled = autoTourStatus === AutoTourStatus.ENABLED;
    const handleActions = useHandleNavigationAndExtraActions(tourCategory);

    // if both plugins are enabled, then the last step is one, otherwise if just one is enabled it must be 0
    const otherToolsLastStep = useGetOtherToolsLastStep();
    const lastStep = tourCategory === TutorialTourName.ONBOARDING_TUTORIAL_STEP ? getLastStep(tourSteps) : otherToolsLastStep;

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
                const telemetryTag = generateTelemetryTag(trackingCategoriesByTourName[tourCategory], tourCategory, eventSuffix);
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
        if (tourCategory === TutorialTourName.EXPLORE_OTHER_TOOLS) {
            dispatch(setProductMenuSwitcherOpen(false));
        }
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
