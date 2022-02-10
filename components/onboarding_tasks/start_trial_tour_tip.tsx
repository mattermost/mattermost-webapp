// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage} from 'react-intl';

import TutorialTourTip, {DataEventSource} from 'components/tutorial_tour_tip/tutorial_tour_tip';
import {useMeasurePunchouts} from '../tutorial_tour_tip/hooks';

import {OnBoardingTaskName, TaskNameMapToSteps} from './constant';
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

    const punchOut = useMeasurePunchouts([], []) || null;

    const handleSaveData = useCallback((source?: DataEventSource) => {
        if (source && source === 'dismiss') {
            handleTask(taskName, steps.start, true, source);
        }
    }, [handleTask]);

    const onPunchOutClick = useCallback(() => {
        handleTask(taskName, steps.FINISHED, true, 'finished');
    }, [handleTask]);

    return (
        <TutorialTourTip
            title={title}
            screen={screen}
            tutorialCategory={taskName}
            step={steps.STARTED}
            placement='left-start'
            pulsatingDotPlacement='left'
            pulsatingDotTranslate={{x: 0, y: -2}}
            width={352}
            autoTour={true}
            punchOut={punchOut}
            showNextBtn={false}
            showPrevBtn={false}
            singleTip={true}
            showOptOut={false}
            eventPropagation={true}
            handleSaveData={handleSaveData}
            onPunchOutClick={onPunchOutClick}
        />
    );
};

