// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from 'components/widgets/tour_tip';

import BoardsImg from 'images/boards_tour_tip.svg';

import OnboardingExploreToolsTourTip from './onboarding_explore_tools_tour_tip';

import './explore_tools_tour_tip.scss';

interface BoardsTourTipProps {
    singleTip: boolean;
}

export const BoardsTourTip = ({singleTip}: BoardsTourTipProps) => {
    const title = (
        <FormattedMessage
            id='onboardingTour.BoardsTourTip.title'
            defaultMessage={'Manage tasks with Boards'}
        />
    );
    const screen = (
        <p>
            <FormattedMessage
                id='onboardingTour.BoardsTourTip.Boards'
                defaultMessage={'Keep every project organized with kanban-style boards that integrate tightly with channel-based collaboration.'}
            />
        </p>
    );

    const overlayPunchOut = useMeasurePunchouts(['product-menu-item-focalboard'], []);

    return (
        <OnboardingExploreToolsTourTip
            title={title}
            screen={screen}
            overlayPunchOut={overlayPunchOut}
            singleTip={singleTip}
            imageURL={BoardsImg}
        />
    );
};

