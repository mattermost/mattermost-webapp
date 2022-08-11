// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from 'components/widgets/tour_tip';

import PlaybooksImg from 'images/playbooks_tour_tip.svg';

import OnboardingExploreToolsTourTip from './onboarding_explore_tools_tour_tip';

import './explore_tools_tour_tip.scss';

interface PlaybooksTourTipProps {
    singleTip: boolean;
}

export const PlaybooksTourTip = ({singleTip}: PlaybooksTourTipProps) => {
    const title = (
        <FormattedMessage
            id='onboardingTour.Playbooks.title'
            defaultMessage={'Build workflows with Playbooks'}
        />
    );
    const screen = (
        <p>
            <FormattedMessage
                id='onboardingTour.Playbooks.Description'
                defaultMessage={'With checklists, automations and integrations, you can define processes that ensure best practices are followed every time.'}
            />
        </p>
    );

    const overlayPunchOut = useMeasurePunchouts(['playbooks'], []);

    return (
        <OnboardingExploreToolsTourTip
            title={title}
            screen={screen}
            overlayPunchOut={overlayPunchOut}
            singleTip={singleTip}
            imageURL={PlaybooksImg}
        />
    );
};

