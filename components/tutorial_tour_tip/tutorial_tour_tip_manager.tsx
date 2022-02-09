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
    AutoTourStatus, ChannelsTourTelemetryPrefix,
    FINISHED,
    SKIPPED,
    TTCategoriesMapToAutoTourStatusKey,
    TTCategoriesMapToSteps,
} from './constant';
import {DataEventSource} from './tutorial_tour_tip';
import {getLastStep} from './utils';

import * as Utils from './utils';

export interface TutorialTourTipManager {
    show: boolean;
    tourSteps: Record<string, number>;
    handleOpen: (e: React.MouseEvent) => void;
    handleSkipTutorial: (e: React.MouseEvent) => void;
    handleDismiss: (e: React.MouseEvent) => void;
    handleSavePreferences: (step: number) => void;
    handlePrevious: (e: React.MouseEvent) => void;
    handlePunchOutClick: (e: React.MouseEvent) => void;
    handleNext: (e?: React.MouseEvent) => void;
}

type Props = {
    autoTour?: boolean;
    telemetryTag?: string;
    tutorialCategory: string;
    step: number;
    onNextNavigateTo?: () => void;
    onPrevNavigateTo?: () => void;
    handleSaveData?: (source?: DataEventSource, step?: number, autoTourStatus?: boolean) => void;
    onPunchOutClick?: () => void;
    extraFunc?: (source?: DataEventSource, step?: string,) => void;
    onDismiss?: () => void;
    eventPropagation?: boolean;
    preventDefault?: boolean;
}

const useTutorialTourTipManager = ({
    autoTour,
    telemetryTag,
    tutorialCategory,
    onNextNavigateTo,
    onPrevNavigateTo,
    onPunchOutClick,
    onDismiss,
    eventPropagation,
    handleSaveData,
    extraFunc,
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
    const saveData = useCallback(
        (stepValue: string, autoTour = true) => {
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
        if (!eventPropagation) {
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
        if (handleSaveData) {
            handleSaveData(source, stepValue);
        } else {
            saveData(stepValue.toString());
        }
        if (onNextNavigateTo && nextStep === true && autoTour) {
            onNextNavigateTo();
        } else if (onPrevNavigateTo && nextStep === false && autoTour) {
            onPrevNavigateTo();
        }
        if (extraFunc) {
            extraFunc(source, stepValue.toString());
        }
    }, [currentStep, autoTour, onNextNavigateTo, onPrevNavigateTo, handleSaveData]);

    const handleDismiss = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleHide();
        if (onDismiss) {
            onDismiss();
        }
        if (telemetryTag && !handleSaveData) {
            const tag = telemetryTag + '_dismiss';
            trackEvent(ChannelsTourTelemetryPrefix, tag);
        }
        if (handleSaveData) {
            handleSaveData('dismiss', currentStep, false);
        } else {
            saveData(currentStep.toString(), false);
        }
    }, [handleSaveData, onDismiss, telemetryTag]);

    const handlePrevious = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);
        handleSavePreferences(false);
    }, [handleSavePreferences]);

    const handleNext = useCallback((e?: React.MouseEvent): void => {
        if (e) {
            handleEventPropagationAndDefault(e);
        }
        if (telemetryTag && !handleSaveData) {
            const tag = telemetryTag + '_next';
            trackEvent(ChannelsTourTelemetryPrefix, tag);
        }
        if (getLastStep(tourSteps) === currentStep) {
            handleSavePreferences(FINISHED);
        } else {
            handleSavePreferences(true);
        }
    }, [telemetryTag, handleSavePreferences]);

    const handleSkipTutorial = useCallback((e: React.MouseEvent): void => {
        handleEventPropagationAndDefault(e);

        if (telemetryTag && !handleSaveData) {
            const tag = telemetryTag + '_skip';
            trackEvent(ChannelsTourTelemetryPrefix, tag);
        }
        if (handleSaveData) {
            handleSaveData('skipped', SKIPPED);
        } else {
            saveData(SKIPPED.toString());
        }
    }, [telemetryTag, handleSavePreferences]);

    const handlePunchOutClick = useCallback((e: React.MouseEvent): void => {
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
        handlePunchOutClick,
        handleSkipTutorial,
        handleSavePreferences,
    };
};

export default useTutorialTourTipManager;
