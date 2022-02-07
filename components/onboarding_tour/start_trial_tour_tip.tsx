// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import TutorialTourTip from 'components/tutorial_tour_tip/tutorial_tour_tip';
import {
    StartTrialTriggerSteps,
    TutorialTourCategories,
} from 'components/tutorial_tour_tip/constant';
import {useMeasurePunchouts} from '../tutorial_tour_tip/hooks';

export const InvitePeopleTour = () => {
    const telemetryTagText = `tutorial_tip_${StartTrialTriggerSteps.START}_start_trial`;

    const title = (
        <FormattedMessage
            id='start_trial.tutorialTip.title'
            defaultMessage={'Try our premium features for free'}
        />
    );
    const screen = (
        <p>
            <FormattedMessage
                id='start_trial.tutorialTip.desc'
                defaultMessage={'Explore our most requested premium features. Determine user access with Guest Accounts, automate compliance reports, and send secure ID-only mobile push notifications.'}
            />
        </p>
    );

    const punchOut = useMeasurePunchouts([], []) || null;

    return (
        <TutorialTourTip
            title={title}
            screen={screen}
            tutorialCategory={TutorialTourCategories.START_TRIAL}
            step={StartTrialTriggerSteps.START}
            placement='right'
            pulsatingDotPlacement='right-end'
            telemetryTag={telemetryTagText}
            width={352}
            autoTour={true}
            punchOut={punchOut}
        />
    );
};

