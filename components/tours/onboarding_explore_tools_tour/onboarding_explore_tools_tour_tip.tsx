// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {ChannelsTourTip, ChannelsTourTipProps} from 'components/tours';

import useBoardingTourTipManager from './explore_tools_tour_manager';

const OnboardingExploreToolsTourTip = (props: Omit<ChannelsTourTipProps, 'manager'>) => {
    return (
        <ChannelsTourTip
            {...props}
            manager={useBoardingTourTipManager}
        />
    );
};

export default OnboardingExploreToolsTourTip;
