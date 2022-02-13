// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import TourTip, {useMeasurePunchouts} from 'components/widgets/tour_tip';

import {OnBoardingTasksName, TaskNameMapToSteps} from './constants';
import {useHandleOnBoardingTaskData} from './onboarding_tasks_manager';

export const VisitSystemConsoleTour = () => {
    const handleTask = useHandleOnBoardingTaskData();
    const taskName = OnBoardingTasksName.VISIT_SYSTEM_CONSOLE;
    const steps = TaskNameMapToSteps[taskName];

    const title = (
        <FormattedMessage
            id='onBoardingTask.visitSystemConsole.title'
            defaultMessage={'Visit the System Console'}
        />
    );
    const screen = (
        <p>
            <FormattedMessage
                id='onBoardingTask.visitSystemConsole.Description'
                defaultMessage={'More detailed configuration settings for your workspace can be accessed here.'}
            />
        </p>
    );

    const overlayPunchOut = useMeasurePunchouts(['product-switcher-menu-dropdown'], []) || null;

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
            pulsatingDotPlacement='right'
            pulsatingDotTranslate={{x: 0, y: -2}}
            handleDismiss={onDismiss}
            singleTip={true}
            showOptOut={false}
            interactivePunchOut={true}
        />
    );
};
