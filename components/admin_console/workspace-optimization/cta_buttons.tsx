// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {useHistory} from 'react-router-dom';

import {trackEvent} from 'actions/telemetry_actions';

import {TELEMETRY_CATEGORIES} from 'utils/constants';

import './dashboard.scss';

type CtaButtonsProps = {
    learnMoreLink?: string;
    learnMoreText?: string;
    actionLink?: string;
    actionText?: React.ReactNode;
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

    const trackClick = () => {
        if (telemetryAction) {
            trackEvent(
                TELEMETRY_CATEGORIES.WORKSPACE_OPTIMIZATION_DASHBOARD,
                'workspace_dashboard_action_' + telemetryAction,
            );
        }
    };

    const handleActionButtonClick = () => {
        if (actionButtonCallback) {
            actionButtonCallback();
        } else if (actionLink) {
            history.push(actionLink);
            trackClick();
        }
    };

    return (
        <div className='ctaButtons'>
            {actionLink && actionText && (
                <button
                    className='actionButton annnouncementBar__purchaseNow'
                    onClick={handleActionButtonClick}
                >
                    {actionText}
                </button>
            )}
            {learnMoreLink && learnMoreText && (
                <a
                    className='learnMoreButton light-blue-btn'
                    href={learnMoreLink}
                    target={learnMoreLink.startsWith('http') ? '_blank' : '_self'}
                    onClick={trackClick}
                    rel='noreferrer'
                >
                    {learnMoreText}
                </a>
            )}
        </div>
    );
};

export default CtaButtons;
