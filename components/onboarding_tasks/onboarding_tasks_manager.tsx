// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {savePreferences as storeSavePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {trackEvent as trackEventAction} from '../../actions/telemetry_actions';

import {OnBoardingTaskCategory} from './constant';
import {generateTelemetryTag} from './utils';

const useOnBoardingTasksManager = () => {
    // Function to save the tutorial step in redux store start here which needs to be modified
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const savePreferences = useCallback(
        (taskCategory: string, taskName, step: number) => {
            const preferences = [
                {
                    user_id: currentUserId,
                    category: taskCategory,
                    name: taskName,
                    value: step.toString(),
                },
            ];
            dispatch(storeSavePreferences(currentUserId, preferences));
        },
        [currentUserId],
    );

    const trackUserEvent = useCallback((category, event, props?) => {
        trackEventAction(category, event, props);
    }, []);

    // Function to save the tutorial step in redux store end here

    const handleTask = useCallback((
        taskName: string,
        step: number,
        trackEvent = true,
        trackEventSuffix?: string,
        taskCategory = OnBoardingTaskCategory,
    ) => {
        savePreferences(taskCategory, taskName, step);
        if (trackEvent) {
            const eventSuffix = trackEventSuffix ? `${step}--${trackEventSuffix}` : step.toString();
            const telemetryTag = generateTelemetryTag(OnBoardingTaskCategory, taskName, eventSuffix);
            trackUserEvent(taskName, telemetryTag);
        }
    }, [savePreferences, trackUserEvent]);
    return handleTask;
};

export default useOnBoardingTasksManager;
