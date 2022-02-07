// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'mattermost-redux/types/store';

import {savePreferences as storeSavePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {trackEvent as trackEventAction} from 'actions/telemetry_actions';

import {
    AutoTourStatus,
    FINISHED,
    SKIPPED,
    TTCategoriesMapToAutoTourStatusKey,
    TTCategoriesMapToSteps,
} from './constant';

import * as Utils from './utils';

export interface TutorialTourTipManager {
    show: boolean;
    tourSteps: Record<string, number>;
    getLastStep: () => number;
    handleOpen: (e: React.MouseEvent) => void;
    handleSkipTutorial: (e: React.MouseEvent) => void;
    handleDismiss: (e: React.MouseEvent) => void;
    handleSavePreferences: (step: number) => void;
    handlePrevious: (e: React.MouseEvent) => void;
    handleNext: (e?: React.MouseEvent) => void;
}

type Props = {
    autoTour?: boolean;
    telemetryTag?: string;
    tutorialCategory: string;
    step: number;
    onNextNavigateTo?: () => void;
    onPrevNavigateTo?: () => void;
    onDismiss?: () => void;
    stopPropagation?: boolean;
    preventDefault?: boolean;
}

const useTutorialTourTipManager = ({
    autoTour,
    telemetryTag,
    tutorialCategory,
    onNextNavigateTo,
    onPrevNavigateTo,
    onDismiss,
    stopPropagation,
    preventDefault,
}: Props): TutorialTourTipManager => {
    const [show, setShow] = useState(false);
    const tourSteps = TTCategoriesMapToSteps[tutorialCategory];

    // Function to save the tutorial step in redux store start here which needs to be modified
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const currentStep = useSelector((state: GlobalState) => getInt(state, tutorialCategory, currentUserId, 0));
    const autoTourStatus = useSelector((state: GlobalState) => getInt(state, TTCategoriesMapToAutoTourStatusKey[tutorialCategory], currentUserId, 0));
    const isAutoTourEnabled = autoTourStatus === AutoTourStatus.ENABLED;
    const savePreferences = useCallback(
        (currentUserId: string, stepValue: string, autoTour = true) => {
            let preferences = [
                {
                    user_id: currentUserId,
                    category: tutorialCategory,
                    name: currentUserId,
                    value: stepValue,
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

    const trackEvent = useCallback((category, event, props?) => {
        trackEventAction(category, event, props);
    }, []);

    // Function to save the tutorial step in redux store end here

    const handleEventPropagationAndDefault = (e: React.MouseEvent | KeyboardEvent) => {
        if (stopPropagation) {
            e.stopPropagation();
        }
        if (preventDefault) {
            e.preventDefault();
        }
    };

    useEffect(() => {
        if (autoTour && isAutoTourEnabled) {
            setShow(true);
        }
    }, [autoTour, isAutoTourEnabled]);

    const handleHide = useCallback((): void => {
        setShow(false);
    }, []);

    const handleOpen = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        setShow(true);
    }, []);

    const handleSavePreferences = useCallback((nextStep: boolean | number, auto = true): void => {
        let stepValue = currentStep;
        if (nextStep === true) {
            stepValue += 1;
        } else if (nextStep === false) {
            stepValue -= 1;
        } else {
            stepValue = nextStep;
        }
        handleHide();
        savePreferences(currentUserId, stepValue.toString(), auto);
        if (onNextNavigateTo && nextStep === true && autoTour) {
            onNextNavigateTo();
        } else if (onPrevNavigateTo && nextStep === false && autoTour) {
            onPrevNavigateTo();
        }
    }, [currentStep, onNextNavigateTo, onPrevNavigateTo]);

    const handleDismiss = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleHide();
        if (onDismiss) {
            onDismiss();
        }
        const tag = telemetryTag + '_dismiss';
        trackEvent('tutorial', tag);
        handleSavePreferences(currentStep, false);
    }, [handleSavePreferences, onDismiss, telemetryTag]);

    const handlePrevious = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleSavePreferences(false);
    }, [handleSavePreferences]);

    const handleNext = useCallback((e?: React.MouseEvent): void => {
        if (e) {
            handleEventPropagationAndDefault(e);
        }
        if (telemetryTag) {
            const tag = telemetryTag + '_next';
            trackEvent('tutorial', tag);
        }
        if (getLastStep() === currentStep) {
            handleSavePreferences(FINISHED);
        } else {
            handleSavePreferences(true);
        }
    }, [telemetryTag, handleSavePreferences]);

    const handleSkipTutorial = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);

        if (telemetryTag) {
            const tag = telemetryTag + '_skip';
            trackEvent('tutorial', tag);
        }
        savePreferences(currentUserId, SKIPPED.toString());
    }, [telemetryTag, handleSavePreferences]);

    const getLastStep = useCallback(() => {
        return Object.values(tourSteps).reduce((maxStep, candidateMaxStep) => {
            // ignore the "opt out" FINISHED step as the max step.
            if (candidateMaxStep > maxStep && candidateMaxStep !== tourSteps.FINISHED) {
                return candidateMaxStep;
            }
            return maxStep;
        }, Number.MIN_SAFE_INTEGER);
    }, [tourSteps]);

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
        handleSkipTutorial,
        handleSavePreferences,
        getLastStep,
    };
};

export default useTutorialTourTipManager;
