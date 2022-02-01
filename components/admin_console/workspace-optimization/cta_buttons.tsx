// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {useHistory} from 'react-router-dom';

import {trackEvent} from 'actions/telemetry_actions';

import {TELEMETRY_CATEGORIES} from 'utils/constants';

import './dashboard.scss';

type CtaButtonsProps = {
    learnMoreLink: string;
    learnMoreText: string;
    actionLink: string;
    actionText: React.ReactNode;
    telemetryAction?: string;
    actionButtonCallback?: () => void;
};

const CtaButtons = ({
    learnMoreLink,
    learnMoreText,
    actionLink,
    actionText,
    telemetryAction,
    actionButtonCallback,
}: CtaButtonsProps): JSX.Element => {
    const history = useHistory();

    const redirectToConsolePage = (route: string) => {
        history.push(route);

        if (telemetryAction) {
            trackEvent(
                TELEMETRY_CATEGORIES.WORKSPACE_OPTIMIZATION_DASHBOARD,
                'health_dashboard_action_' + telemetryAction,
            );
        }
    };

    const handleActionButtonClick = () => {
        if (actionButtonCallback) {
            actionButtonCallback();
        } else if (actionLink) {
            redirectToConsolePage(actionLink);
        }
    };

    const learnMoreButton = (
        <button
            className='learnMoreButton light-blue-btn'
            onClick={() => redirectToConsolePage(learnMoreLink)}
        >
            {learnMoreText}
        </button>
    );

    const actionButton = (
        <button
            className='actionButton annnouncementBar__purchaseNow'
            onClick={handleActionButtonClick}
        >
            {actionText}
        </button>
    );
    return (
        <div className='ctaButtons'>
            {actionButton}
            {learnMoreButton}
        </div>
    );
};

export default CtaButtons;
