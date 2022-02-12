// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '../widgets/tour_tip';

import OnBoardingTourTip from './onboarding_tour_tip';

export const InvitePeopleTour = () => {
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

    const overlayPunchOut = useMeasurePunchouts(['showMoreChannels', 'invitePeople'], [], {y: -8, height: 16, x: 0, width: 0}) || null;

    return (
        <OnBoardingTourTip
            title={title}
            screen={screen}
            placement='right-start'
            pulsatingDotPlacement='right-end'
            pulsatingDotTranslate={{x: 0, y: -18}}
            width={352}
            overlayPunchOut={overlayPunchOut}
        />
    );
};
