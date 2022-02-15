// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import TourTip, {useMeasurePunchouts} from 'components/widgets/tour_tip';

import {OnboardingTasksName, TaskNameMapToSteps} from './constants';
import {useHandleOnBoardingTaskData} from './onboarding_tasks_manager';

export const CompleteYourProfileTour = () => {
    const handleTask = useHandleOnBoardingTaskData();
    const taskName = OnboardingTasksName.COMPLETE_YOUR_PROFILE;
    const steps = TaskNameMapToSteps[taskName];

    const title = (
        <FormattedMessage
            id='onboardingTask.completeYourProfileTour.title'
            defaultMessage={'Edit your profile'}
        />
    );
    const screen = (
        <p>
            <FormattedMessage
                id='onboardingTask.completeYourProfileTour.Description'
                defaultMessage={'Use this menu item to update your profile details and security settings.'}
            />
        </p>
    );

    const overlayPunchOut = useMeasurePunchouts(['status-drop-down-menu-list'], [], {y: -6, height: 12, x: 0, width: 0});
    const onDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        handleTask(taskName, steps.START, true, 'dismiss');
    };

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
