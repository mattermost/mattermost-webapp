// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import CustomImg from 'images/Customize-Your-Experience.gif';
import {useMeasurePunchouts} from 'components/widgets/tour_tip';

import OnBoardingTourTip from './onboarding_tour_tip';

export const CustomizeYourExperienceTour = () => {
    const title = (
        <FormattedMessage
            id='onBoardingTour.customizeYourExperience.title'
            defaultMessage={'Customize your experience'}
        />
    );
    const screen = (
        <p>
            <FormattedMessage
                id='onBoardingTour.customizeYourExperience.Description'
                defaultMessage={'Set your availability, add a custom status, and access Settings and your Profile to configure your experience, including notification preferences and custom theme colors.'}
            />
        </p>
    );

    const overlayPunchOut = useMeasurePunchouts(['RightControlsContainer'], [], {y: 6, height: -6, x: 64, width: 0}) || null;

    return (
        <OnBoardingTourTip
            title={title}
            screen={screen}
            imageURL={CustomImg}
            placement='bottom-end'
            pulsatingDotPlacement='bottom'
            pulsatingDotTranslate={{x: 20, y: -6}}
            offset={[18, 4]}
            width={352}
            overlayPunchOut={overlayPunchOut}
        />
    );
};

