// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';

import {setPostPriorityInitialisationState} from 'mattermost-redux/actions/preferences';

import {Preferences} from 'mattermost-redux/constants';

import {showPostPriorityTooltip} from 'selectors/posts';
import {getShowTaskListBool} from 'selectors/onboarding';

import {TourTip, useMeasurePunchouts} from '@mattermost/components';

const pulsatingDotTranslate = {x: -2, y: -4};
const title = (
    <FormattedMessage
        id='post_priority.tutorial_tip.title'
        defaultMessage='Message Priority'
    />
);

const screen = (
    <FormattedMessage
        id='post_priority.tutorial_tip.description'
        defaultMessage='Messages can now be marked as important or urgent with the ability to request acknowledgement or notify team members persistently to ensure your messages are seen.'
    />
);

const prevBtn = (
    <FormattedMessage
        id='activityAndInsights.tutorial_tip.not_now'
        defaultMessage='Not now'
    />
);

const nextBtn = (
    <FormattedMessage
        id='activityAndInsights.tutorial_tip.try_it'
        defaultMessage='Try it out'
    />
);

type Props = {
    onSuccess: () => void;
    canShow: boolean;
}

const PostPriorityTourTip = ({onSuccess, canShow}: Props) => {
    const dispatch = useDispatch();
    const showTip = useSelector(showPostPriorityTooltip);
    const [showTaskList, firstTimeOnboarding] = useSelector(getShowTaskListBool, shallowEqual);

    const [open, setOpen] = useState(false);

    const saveState = useCallback((viewed: boolean) => {
        if (viewed) {
            dispatch(setPostPriorityInitialisationState({[Preferences.POST_PRIORITY_VIEWED]: true}));
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [dispatch]);

    const handleDismiss = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        saveState(true);
    }, [saveState]);

    const handleNext = useCallback(() => {
        saveState(true);
        onSuccess();
    }, [onSuccess, saveState]);

    const handleOpen = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        saveState(open);
    }, [saveState, open]);

    const isOnboardingOngoing = useCallback(() => {
        if (showTaskList && firstTimeOnboarding) {
            return true;
        }
        return false;
    }, [showTaskList, firstTimeOnboarding]);

    const overlayPunchOut = useMeasurePunchouts(['post_priority_picker_icon'], []);

    useEffect(() => {
        // If the user has ongoing onboarding steps we want to just remove the insights intro modal in order to not overburden with tips
        if (showTip && isOnboardingOngoing()) {
            dispatch(setPostPriorityInitialisationState({[Preferences.POST_PRIORITY_VIEWED]: true}));
        }
    }, [dispatch, showTip, isOnboardingOngoing]);

    return (
        <>
            {
                (showTip && !isOnboardingOngoing()) &&
                <TourTip
                    show={open && canShow}
                    singleTip={true}
                    screen={screen}
                    title={title}
                    overlayPunchOut={overlayPunchOut}
                    placement='top-start'
                    pulsatingDotPlacement='top'
                    pulsatingDotTranslate={pulsatingDotTranslate}
                    step={1}
                    showOptOut={false}
                    handleDismiss={handleDismiss}
                    handleNext={handleNext}
                    handleOpen={handleOpen}
                    handlePrevious={handleDismiss}
                    nextBtn={nextBtn}
                    prevBtn={prevBtn}
                />
            }
        </>
    );
};

export default memo(PostPriorityTourTip);
