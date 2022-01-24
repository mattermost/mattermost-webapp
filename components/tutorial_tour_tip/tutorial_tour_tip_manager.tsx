// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'mattermost-redux/types/store';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {trackEvent} from '../../actions/telemetry_actions';
import Constants, {Preferences} from 'utils/constants';
import * as Utils from 'utils/utils';

const FINISHED = '-1';
const TutorialSteps = {
    [Preferences.TUTORIAL_STEP]: Constants.TutorialSteps,
};
type Props = {
    autoTour?: boolean;
    telemetryTag?: string;
    tutorialCategory: string;
    step: number;
    onNextNavigateTo?: () => void;
    onPrevNavigateTo?: () => void;
}
const useTutorialTourTipManager = ({step, autoTour, telemetryTag, tutorialCategory, onNextNavigateTo, onPrevNavigateTo}: Props) => {
    const [show, setShow] = useState(false);
    const currentUserId = useSelector(getCurrentUserId);
    const currentStep = useSelector((state: GlobalState) => getInt(state, tutorialCategory, currentUserId, 0));
    const dispatch = useDispatch();
    const handleKeyDown = useCallback((e: KeyboardEvent): void => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.ENTER) && show) {
            handleNext();
        }
    }, [show]);
    useEffect(() => {
        if (autoTour) {
            setShow(true);
        }
    }, [autoTour]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () =>
            window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const hide = (): void => {
        setShow(false);
    };

    const dismiss = (): void => {
        hide();
        handleNext(false);
        const tag = telemetryTag + '_dismiss';
        trackEvent('tutorial', tag);
    };

    const handleSavePreferences = (autoTour: boolean, nextStep: boolean | number): void => {
        // change this
        let stepValue = currentStep || step;
        if (nextStep === true) {
            stepValue += 1;
        } else if (nextStep === false) {
            stepValue -= 1;
        } else {
            stepValue = nextStep;
        }
        const preferences = [
            {
                user_id: currentUserId,
                category: tutorialCategory || Preferences.TUTORIAL_STEP,
                name: currentUserId,
                value: stepValue.toString(),
            },
        ];

        hide();
        dispatch(savePreferences(currentUserId, preferences));
        if (onNextNavigateTo && nextStep === true && autoTour) {
            onNextNavigateTo();
        } else if (onPrevNavigateTo && nextStep === false && autoTour) {
            onPrevNavigateTo();
        }
    };

    const handlePrevious = (e: React.MouseEvent): void => {
        e.preventDefault();
        handleSavePreferences(true, false);
    };

    const handleNext = (auto = true, e?: React.MouseEvent): void => {
        e?.preventDefault();
        if (telemetryTag) {
            const tag = telemetryTag + '_next';
            trackEvent('tutorial', tag);
        }
        if (getLastStep() === currentStep) {
            handleSavePreferences(auto, TutorialSteps[tutorialCategory].FINISHED);
        } else {
            handleSavePreferences(auto, true);
        }
    };

    const skipTutorial = (e: React.MouseEvent): void => {
        e.preventDefault();

        if (telemetryTag) {
            const tag = telemetryTag + '_skip';
            trackEvent('tutorial', tag);
        }
        const preferences = [{
            user_id: currentUserId,
            category: tutorialCategory || Preferences.TUTORIAL_STEP,
            name: currentUserId,
            value: FINISHED.toString(),
        }];
        dispatch(savePreferences(currentUserId, preferences));
    };
    const tourSteps = TutorialSteps[tutorialCategory];
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
        hide,
        dismiss,
        handleNext,
        handlePrevious,
        skipTutorial,
        getLastStep,
        tourSteps,
        setShow,
    };
};

export default useTutorialTourTipManager;
