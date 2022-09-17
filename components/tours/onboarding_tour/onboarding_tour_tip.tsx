// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {ChannelsTourTip, ChannelsTourTipProps} from 'components/tours';

import useBoardingTourTipManager from './onboarding_tour_manager';

const OnboardingTourTip = (props: Omit<ChannelsTourTipProps, 'manager'>) => {
    return (
        <ChannelsTourTip
            {...props}
            manager={useBoardingTourTipManager}
        />
    );
};

export default OnboardingTourTip;
