// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import TutorialTourTip from 'components/tutorial_tour_tip/tutorial_tour_tip';
import {
    OnBoardingTourSteps,
    TutorialTourCategories,
} from 'components/tutorial_tour_tip/constant';
import {useMeasurePunchouts} from 'components/tutorial_tour_tip/hooks';
import {setAddChannelDropdown} from '../../actions/views/add_channel_dropdown';
import {setOnBoardingTaskList} from '../../actions/views/onboarding_task_list';
import {isFirstAdmin} from '../next_steps_view/steps';

const CreateAndJoinChannelsTour = () => {
    const dispatch = useDispatch();
    const isUserFirstAdmin = useSelector(isFirstAdmin);
    const telemetryTagText = `tutorial_tip_${OnBoardingTourSteps.CREATE_AND_JOIN_CHANNELS}_Create_Join_Channels`;

    const title = (
        <FormattedMessage
            id='onBoardingTour.CreateAndJoinChannels.title'
            defaultMessage={'Create and join channels'}
        />
    );
    const screen = (
        <p>
            <FormattedMessage
                id='onBoardingTour.CreateAndJoinChannels.Description'
                defaultMessage={'Create new channels or browse available channels to see what your team is discussing. As you join channels, organize them into  categories based on how you work.'}
            />
        </p>
    );

    const openAddChannelDropdown = () => {
        dispatch(setAddChannelDropdown(true));
    };

    const closeAddChannelDropdown = () => {
        dispatch(setAddChannelDropdown(false));
    };

    const onDismiss = () => {
        if (isUserFirstAdmin) {
            dispatch(setOnBoardingTaskList(true));
        }
    };

    const punchOut = useMeasurePunchouts(['showMoreChannels', 'invitePeople'], [], {y: -8, height: 16, x: 0, width: 0}) || null;

    return (
        <TutorialTourTip
            title={title}
            screen={screen}
            tutorialCategory={TutorialTourCategories.ON_BOARDING}
            step={OnBoardingTourSteps.CREATE_AND_JOIN_CHANNELS}
            placement='right-start'
            pulsatingDotPlacement='right-start'
            pulsatingDotTranslate={{x: 0, y: 18}}
            telemetryTag={telemetryTagText}
            width={352}
            autoTour={true}
            punchOut={punchOut}
            onNextNavigateTo={openAddChannelDropdown}
            onPrevNavigateTo={closeAddChannelDropdown}
            onDismiss={onDismiss}
        />
    );
};

export default CreateAndJoinChannelsTour;

