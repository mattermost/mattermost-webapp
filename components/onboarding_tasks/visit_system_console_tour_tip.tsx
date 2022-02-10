// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import TutorialTourTip, {DataEventSource} from 'components/tutorial_tour_tip/tutorial_tour_tip';
import {browserHistory} from 'utils/browser_history';
import {useMeasurePunchouts} from 'components/tutorial_tour_tip/hooks';

import {OnBoardingTaskName, TaskNameMapToSteps} from './constant';
import {useHandleOnBoardingTaskData} from './onboarding_tasks_manager';

export const VisitSystemConsoleTour = () => {
    const handleTask = useHandleOnBoardingTaskData();
    const taskName = OnBoardingTaskName.VISIT_SYSTEM_CONSOLE;
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

    const punchOut = useMeasurePunchouts(['product-switcher-menu-dropdown'], []) || null;

    const handleSaveData = (source?: DataEventSource) => {
        if (source && source === 'dismiss') {
            handleTask(taskName, steps.start, true, source);
        }
    };

    const onPunchOutClick = () => {
        browserHistory.push('/admin_console');
        handleTask(taskName, steps.FINISHED, true, 'finished');
    };

    return (
        <TutorialTourTip
            title={title}
            screen={screen}
            tutorialCategory={taskName}
            step={steps.STARTED}
            placement='left-start'
            pulsatingDotPlacement='right'
            pulsatingDotTranslate={{x: 0, y: 0}}
            width={352}
            autoTour={true}
            punchOut={punchOut}
            showNextBtn={false}
            showPrevBtn={false}
            singleTip={true}
            showOptOut={false}
            handleSaveData={handleSaveData}
            onPunchOutClick={onPunchOutClick}
        />
    );
};

export default VisitSystemConsoleTour;
