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

    const getClickHandler = (id: string) => () => {
        if (typeof actionButtonCallback === 'function') {
            actionButtonCallback();
        } else if (actionLink?.startsWith('/')) {
            history.push(actionLink);
        } else if (actionLink?.startsWith('http')) {
            window.open(actionLink, '_blank');
        }

        if (telemetryAction) {
            trackEvent(
                TELEMETRY_CATEGORIES.WORKSPACE_OPTIMIZATION_DASHBOARD,
                `workspace_dashboard_${telemetryAction}_${id}`,
            );
        }
    };

    return (
        <div className='ctaButtons'>
            {actionLink && actionText && (
                <button
                    className='actionButton annnouncementBar__purchaseNow'
                    onClick={getClickHandler('cta')}
                >
                    {actionText}
                </button>
            )}
            {learnMoreLink && learnMoreText && (
                <button
                    className='learnMoreButton light-blue-btn'
                    onClick={getClickHandler('learn-more')}
                >
                    {learnMoreText}
                </button>
            )}
        </div>
    );
};

export default CtaButtons;
