// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from 'components/widgets/tour_tip';

import OnBoardingTourTip from './onboarding_tour_tip';

export const CreateAndJoinChannelsTour = () => {
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

    const overlayPunchOut = useMeasurePunchouts(['showMoreChannels', 'invitePeople'], [], {y: -8, height: 16, x: 0, width: 0}) || null;

    return (
        <OnBoardingTourTip
            title={title}
            screen={screen}
            placement='right-start'
            pulsatingDotPlacement='right-start'
            pulsatingDotTranslate={{x: 0, y: 18}}
            width={352}
            overlayPunchOut={overlayPunchOut}
        />
    );
};

