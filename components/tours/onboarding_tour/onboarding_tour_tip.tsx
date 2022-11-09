// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {GlobalState} from '@mattermost/types/store';

import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import {ChannelsTourTip, ChannelsTourTipProps, TutorialTourName} from 'components/tours';

const OnboardingTourTip = (props: Omit<ChannelsTourTipProps, 'tourCategory'>) => {
    // restrict the 'learn more about messaging' tour when user is guest (townSquare, channel creation and user invite are restricted to guest)
    const isGuestUser = useSelector((state: GlobalState) => isCurrentUserGuestUser(state));
    return (
        <ChannelsTourTip
            {...props}
            tourCategory={isGuestUser ? TutorialTourName.ONBOARDING_TUTORIAL_STEP_FOR_GUESTS : TutorialTourName.ONBOARDING_TUTORIAL_STEP}
        />
    );
};

export default OnboardingTourTip;
