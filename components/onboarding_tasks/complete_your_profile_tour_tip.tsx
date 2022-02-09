// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

import TutorialTourTip, {DataEventSource} from 'components/tutorial_tour_tip/tutorial_tour_tip';
import {openModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {useMeasurePunchouts} from 'components/tutorial_tour_tip/hooks';
import UserSettingsModal from 'components/user_settings/modal';

import {OnBoardingTaskName, TaskNameMapToSteps} from './constant';
import useOnBoardingTasksManager from './onboarding_tasks_manager';

const CompleteYourProfileTour = () => {
    const dispatch = useDispatch();
    const handleTask = useOnBoardingTasksManager();
    const taskName = OnBoardingTaskName.COMPLETE_YOUR_PROFILE;
    const steps = TaskNameMapToSteps[taskName];

    const title = (
        <FormattedMessage
            id='onBoardingTask.completeYourProfileTour.title'
            defaultMessage={'Edit your profile'}
        />
    );
    const screen = (
        <p>
            <FormattedMessage
                id='onBoardingTask.completeYourProfileTour.Description'
                defaultMessage={'Use this menu item to update your profile details and security settings.'}
            />
        </p>
    );

    const punchOut = useMeasurePunchouts(['status-drop-down-menu-list'], [], {y: -6, height: 6, x: 0, width: 0}) || null;
    const handleSaveData = useCallback((source?: DataEventSource) => {
        if (source && source === 'dismiss') {
            handleTask(taskName, steps.start, true, source);
        }
    }, [handleTask]);

    const onPunchOutClick = useCallback(() => {
        dispatch(openModal({
            modalId: ModalIdentifiers.USER_SETTINGS,
            dialogType: UserSettingsModal,
            dialogProps: {
                isContentProductSettings: false,
            },
        }));
        handleTask(taskName, steps.FINISHED, true, 'finished');
    }, [handleTask]);

    return (
        <TutorialTourTip
            title={title}
            screen={screen}
            tutorialCategory={OnBoardingTaskName.COMPLETE_YOUR_PROFILE}
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
            handleSaveData={handleSaveData}
            onPunchOutClick={onPunchOutClick}
        />
    );
};

export default CompleteYourProfileTour;
