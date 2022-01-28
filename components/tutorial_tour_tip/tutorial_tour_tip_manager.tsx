// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'mattermost-redux/types/store';

import {savePreferences as storeSavePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {trackEvent as trackEventAction} from 'actions/telemetry_actions';

import {FINISHED, TTCategoriesMapToSteps} from './tutorial_tour_tip.constant';

import * as Utils from './tutorial_tour_tip.utils';

export interface TutorialTourTipManager {
    show: boolean;
    tourSteps: Record<string, number>;
    getLastStep: () => number;
    handleOpen: (e: React.MouseEvent) => void;
    handleHide: (e: React.MouseEvent) => void;
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
    stopPropagation?: boolean;
    preventDefault?: boolean;
}

const useTutorialTourTipManager = ({
    autoTour,
    telemetryTag,
    tutorialCategory,
    onNextNavigateTo,
    onPrevNavigateTo,
    stopPropagation,
    preventDefault,
}: Props): TutorialTourTipManager => {
    const [show, setShow] = useState(false);
    const tourSteps = TTCategoriesMapToSteps[tutorialCategory];

    // Function to save the tutorial step in redux store start here which needs to be modified
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const currentStep = useSelector((state: GlobalState) => getInt(state, tutorialCategory, currentUserId, 0));
    const savePreferences = useCallback(
        (currentUserId: string, stepValue: string) => {
            const preferences = [
                {
                    user_id: currentUserId,
                    category: tutorialCategory,
                    name: currentUserId,
                    value: stepValue,
                },
            ];
            dispatch(storeSavePreferences(currentUserId, preferences));
        },
        [dispatch],
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
        if (autoTour) {
            setShow(true);
        }
    }, [autoTour]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (Utils.isKeyPressed(e, Utils.KeyCodes.ENTER)) {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () =>
            window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleHide = (e?: React.MouseEvent): void => {
        if (e) {
            handleEventPropagationAndDefault(e);
        }
        setShow(false);
    };

    const handleOpen = (e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        setShow(true);
    };

    const handleDismiss = (e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleHide();

        // open for discussion should we move forward if user dismiss like next time show them next tip instead of the same one.
        handleNext(e);
        const tag = telemetryTag + '_dismiss';
        trackEvent('tutorial', tag);
    };

    const handleSavePreferences = (nextStep: boolean | number): void => {
        let stepValue = currentStep;
        if (nextStep === true) {
            stepValue += 1;
        } else if (nextStep === false) {
            stepValue -= 1;
        } else {
            stepValue = nextStep;
        }
        handleHide();
        savePreferences(currentUserId, stepValue.toString());
        if (onNextNavigateTo && nextStep === true && autoTour) {
            onNextNavigateTo();
        } else if (onPrevNavigateTo && nextStep === false && autoTour) {
            onPrevNavigateTo();
        }
    };

    const handlePrevious = (e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleSavePreferences(false);
    };

    const handleNext = (e?: React.MouseEvent): void => {
        if (e) {
            handleEventPropagationAndDefault(e);
        }
        if (telemetryTag) {
            const tag = telemetryTag + '_next';
            trackEvent('tutorial', tag);
        }
        if (getLastStep() === currentStep) {
            handleSavePreferences(TTCategoriesMapToSteps[tutorialCategory].FINISHED);
        } else {
            handleSavePreferences(true);
        }
    };

    const handleSkipTutorial = (e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);

        if (telemetryTag) {
            const tag = telemetryTag + '_skip';
            trackEvent('tutorial', tag);
        }
        savePreferences(currentUserId, FINISHED.toString());
    };

    const getLastStep = () => {
        return Object.values(tourSteps).reduce((maxStep, candidateMaxStep) => {
            // ignore the "opt out" FINISHED step as the max step.
            if (candidateMaxStep > maxStep && candidateMaxStep !== tourSteps.FINISHED) {
                return candidateMaxStep;
            }
            return maxStep;
        }, Number.MIN_SAFE_INTEGER);
    };

    return {
        show,
        tourSteps,
        handleOpen,
        handleHide,
        handleDismiss,
        handleNext,
        handlePrevious,
        handleSkipTutorial,
        handleSavePreferences,
        getLastStep,
    };
};

export default useTutorialTourTipManager;
