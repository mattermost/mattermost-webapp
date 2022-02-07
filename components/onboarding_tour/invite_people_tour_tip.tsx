// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

import TutorialTourTip from 'components/tutorial_tour_tip/tutorial_tour_tip';
import {
    OnBoardingTourSteps,
    TutorialTourCategories,
} from 'components/tutorial_tour_tip/constant';
import {setAddChannelDropdown} from '../../actions/views/add_channel_dropdown';
import {useMeasurePunchouts} from '../tutorial_tour_tip/hooks';

export const InvitePeopleTour = () => {
    const dispatch = useDispatch();
    const telemetryTagText = `tutorial_tip_${OnBoardingTourSteps.INVITE_PEOPLE}_Invite_People`;

    const title = (
        <FormattedMessage
            id='onBoardingTour.invitePeople.title'
            defaultMessage={'Invite people to the team'}
        />
    );
    const screen = (
        <p>
            <FormattedMessage
                id='onBoardingTour.invitePeople.Description'
                defaultMessage={'Invite members of your organization or external guests to the team and start collaborating with them.'}
            />
        </p>
    );

    const openAddChannelDropdown = () => {
        dispatch(setAddChannelDropdown(true));
    };

    const closeAddChannelDropdown = () => {
        dispatch(setAddChannelDropdown(false));
    };

    return (
        <TutorialTourTip
            title={title}
            screen={screen}
            tutorialCategory={TutorialTourCategories.ON_BOARDING}
            step={OnBoardingTourSteps.INVITE_PEOPLE}
            placement='right-start'
            pulsatingDotPlacement='right-end'
            pulsatingDotTranslate={{x: 0, y: -18}}
            telemetryTag={telemetryTagText}
            width={352}
            autoTour={true}
            punchOut={useMeasurePunchouts(['showMoreChannels', 'invitePeople'], [], {y: -8, height: 16, x: 0, width: 0})}
            onNextNavigateTo={closeAddChannelDropdown}
            onPrevNavigateTo={openAddChannelDropdown}
            onDismiss={closeAddChannelDropdown}
        />
    );
};

