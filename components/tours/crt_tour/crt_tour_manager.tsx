// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'types/store';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {open as openLhs, close as closeLhs} from 'actions/views/lhs';
import {browserHistory} from 'utils/browser_history';
import {
    ActionType,
    AutoTourStatus,
    ChannelsTourTipManager,
    CrtTutorialSteps,
    FINISHED,
    getLastStep,
    isKeyPressed,
    KeyCodes,
    SKIPPED, TTNameMapToATStatusKey,
    TutorialTourName,
} from 'components/tours';

const useHandleNavigationAndExtraActions = () => {
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const teamUrl = useSelector((state: GlobalState) => getCurrentRelativeTeamUrl(state));

    const nextStepActions = useCallback((step: number) => {
        switch (step) {
        case CrtTutorialSteps.WELCOME_POPOVER : {
            dispatch(openLhs());
            break;
        }
        case CrtTutorialSteps.LIST_POPOVER : {
            const nextUrl = `${teamUrl}/threads`;
            browserHistory.push(nextUrl);
            break;
        }
        case CrtTutorialSteps.UNREAD_POPOVER : {
            break;
        }
        default:
        }
    }, [currentUserId]);

    const lastStepActions = useCallback((lastStep: number) => {
        switch (lastStep) {
        case CrtTutorialSteps.WELCOME_POPOVER : {
            dispatch(closeLhs());
            break;
        }
        case CrtTutorialSteps.LIST_POPOVER : {
            break;
        }
        case CrtTutorialSteps.UNREAD_POPOVER : {
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

export const useCrtTourManager = (): ChannelsTourTipManager => {
    const [show, setShow] = useState(false);
    const tourSteps = CrtTutorialSteps;
    const tourCategory = TutorialTourName.CRT_TUTORIAL_STEP;
    const handleActions = useHandleNavigationAndExtraActions();

    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const currentStep = useSelector((state: GlobalState) =>
        getInt(
            state,
            tourCategory,
            currentUserId,
            0,
        ),
    );

    const isAutoTourEnabled =
        useSelector((state: GlobalState) =>
            getInt(
                state,
                TTNameMapToATStatusKey[tourCategory],
                currentUserId,
                AutoTourStatus.ENABLED,
            ),
        ) === AutoTourStatus.ENABLED;

    useEffect(() => {
        if (isAutoTourEnabled) {
            setShow(true);
        }
    }, [isAutoTourEnabled]);

    const handleEventPropagationAndDefault = (
        e: React.MouseEvent | KeyboardEvent,
    ) => {
        e.stopPropagation();
        e.preventDefault();
    };

    const handleSaveDataAndTrackEvent = useCallback(
        (stepValue: number, eventSource: ActionType, autoTour = true) => {
            const preferences = [
                {
                    user_id: currentUserId,
                    category: tourCategory,
                    name: currentUserId,
                    value: stepValue.toString(),
                },
                {
                    user_id: currentUserId,
                    category: TTNameMapToATStatusKey[tourCategory],
                    name: currentUserId,
                    value: (autoTour && !(eventSource === 'skipped' || eventSource === 'dismiss') ? AutoTourStatus.ENABLED : AutoTourStatus.DISABLED).toString(),
                },
            ];
            dispatch(savePreferences(currentUserId, preferences));
        },
        [currentUserId, tourCategory],
    );

    useEffect(() => {
        if (isAutoTourEnabled) {
            setShow(true);
        }
    }, [isAutoTourEnabled]);

    const handleHide = useCallback((): void => {
        setShow(false);
    }, []);

    const handleOpen = useCallback(
        (e: React.MouseEvent): void => {
            handleEventPropagationAndDefault(e);
            setShow(true);
        },
        [],
    );

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
