// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'mattermost-redux/types/store';

import {savePreferences as storeSavePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {
    AutoTourStatus,
    FINISHED,
    SKIPPED,
    TTCategoriesMapToAutoTourStatusKey,
    TTCategoriesMapToSteps, TutorialTourCategories,
} from './constant';
import {DataEventSource} from './onboarding_tour_tip';
import {getLastStep} from './utils';

import * as Utils from './utils';

export interface TutorialTourTipManager {
    show: boolean;
    tourSteps: Record<string, number>;
    handleOpen: (e: React.MouseEvent) => void;
    handleSkip: (e: React.MouseEvent) => void;
    handleDismiss: (e: React.MouseEvent) => void;
    handleSavePreferences: (step: number) => void;
    handlePrevious: (e: React.MouseEvent) => void;
    handlePunchOut: (e: React.MouseEvent) => void;
    handleNext: (e?: React.MouseEvent) => void;
}

type Props = {
    onNextNavigateTo?: () => void;
    onPrevNavigateTo?: () => void;
    onPunchOutClick?: () => void;
    extraFunc?: (source?: DataEventSource, step?: string,) => void;
    onDismiss?: () => void;
    eventPropagation?: boolean;
    preventDefault?: boolean;
}

const useOnBoardingTourTipManager = ({
    onNextNavigateTo,
    onPrevNavigateTo,
    onPunchOutClick,
    onDismiss,
    eventPropagation,
    preventDefault = true,
}: Props): TutorialTourTipManager => {
    const [show, setShow] = useState(false);
    const tutorialCategory = TutorialTourCategories.ON_BOARDING;
    const tourSteps = TTCategoriesMapToSteps[tutorialCategory];

    // Function to save the tutorial step in redux store start here which needs to be modified
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const currentStep = useSelector((state: GlobalState) => getInt(state, tutorialCategory, currentUserId, 0));
    const autoTourStatus = useSelector((state: GlobalState) => getInt(state, TTCategoriesMapToAutoTourStatusKey[tutorialCategory], currentUserId, 0));
    const isAutoTourEnabled = autoTourStatus === AutoTourStatus.ENABLED;
    const handleSaveData = useCallback(
        (stepValue: number, source?: DataEventSource, autoTour?: boolean) => {
            let preferences = [
                {
                    user_id: currentUserId,
                    category: tutorialCategory,
                    name: currentUserId,
                    value: stepValue.toString(),
                },
            ];
            if (TTCategoriesMapToAutoTourStatusKey[tutorialCategory]) {
                preferences = [...preferences,
                    {
                        user_id: currentUserId,
                        category: TTCategoriesMapToAutoTourStatusKey[tutorialCategory],
                        name: currentUserId,
                        value: (autoTour ? AutoTourStatus.ENABLED : AutoTourStatus.DISABLED).toString(),
                    },
                ];
            }
            dispatch(storeSavePreferences(currentUserId, preferences));
        },
        [tutorialCategory, currentUserId],
    );

    // Function to save the tutorial step in redux store end here

    const handleEventPropagationAndDefault = (e: React.MouseEvent | KeyboardEvent) => {
        if (!eventPropagation) {
            e.stopPropagation();
        }
        if (preventDefault) {
            e.preventDefault();
        }
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
    }, []);

    const handleSavePreferences = useCallback((nextStep: boolean | number): void => {
        let stepValue = currentStep;
        let source: DataEventSource;
        if (nextStep === true) {
            stepValue += 1;
            source = 'next';
        } else if (nextStep === false) {
            stepValue -= 1;
            source = 'prev';
        } else {
            stepValue = nextStep;
            source = 'jump';
        }
        handleHide();
        handleSaveData(stepValue, source);
        if (onNextNavigateTo && nextStep === true) {
            onNextNavigateTo();
        } else if (onPrevNavigateTo && nextStep === false) {
            onPrevNavigateTo();
        }
    }, [currentStep, onNextNavigateTo, onPrevNavigateTo, handleSaveData]);

    const handleDismiss = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleHide();
        if (onDismiss) {
            onDismiss();
        }
        handleSaveData(currentStep, 'dismiss', false);
    }, [handleSaveData, onDismiss]);

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

    const handleSkip = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleSaveData(SKIPPED, 'skipped');
    }, [handleSavePreferences]);

    const handlePunchOut = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        if (onPunchOutClick) {
            onPunchOutClick();
        }
    }, [onPunchOutClick]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (Utils.isKeyPressed(e, Utils.KeyCodes.ENTER)) {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () =>
            window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext]);

    return {
        show,
        tourSteps,
        handleOpen,
        handleDismiss,
        handleNext,
        handlePrevious,
        handlePunchOut,
        handleSkip,
        handleSavePreferences,
    };
};

export default useOnBoardingTourTipManager;
