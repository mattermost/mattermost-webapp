// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage} from 'react-intl';

import TourTip, {useMeasurePunchouts} from 'components/widgets/tour_tip';

import {OnBoardingTaskName, TaskNameMapToSteps} from './constants';
import {useHandleOnBoardingTaskData} from './onboarding_tasks_manager';

export const InvitePeopleTour = () => {
    const handleTask = useHandleOnBoardingTaskData();
    const taskName = OnBoardingTaskName.START_TRIAL;
    const steps = TaskNameMapToSteps[taskName];

    const title = (
        <FormattedMessage
            id='start_trial.tutorialTip.title'
            defaultMessage={'Try our premium features for free'}
        />
    );
    const screen = (
        <p>
            <FormattedMessage
                id='start_trial.tutorialTip.desc'
                defaultMessage={'Explore our most requested premium features. Determine user access with Guest Accounts, automate compliance reports, and send secure ID-only mobile push notifications.'}
            />
        </p>
    );

    const overlayPunchOut = useMeasurePunchouts([], []) || null;

    const onDismiss = useCallback(() => {
        handleTask(taskName, steps.start, true, 'dismiss');
    }, [handleTask]);

    return (
        <TourTip
            show={true}
            title={title}
            screen={screen}
            overlayPunchOut={overlayPunchOut}
            step={steps.STARTED}
            placement='left-start'
            pulsatingDotPlacement='left'
            pulsatingDotTranslate={{x: 0, y: -2}}
            handleDismiss={onDismiss}
            singleTip={true}
            showOptOut={false}
            interactivePunchOut={true}
        />
    );
};

