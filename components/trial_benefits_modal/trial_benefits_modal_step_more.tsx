// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useHistory} from 'react-router-dom';

import {trackEvent} from 'actions/telemetry_actions';

import {TELEMETRY_CATEGORIES} from 'utils/constants';

import './trial_benefits_modal_step_more.scss';

export type TrialBenefitsModalStepMoreProps = {
    id: string;
    route: string;
    message: string;
    onClick?: () => void;
    styleLink?: boolean; // show as a anchor link
}

const TrialBenefitsModalStepMore = (
    {
        id,
        route,
        message,
        onClick,
        styleLink = false,
    }: TrialBenefitsModalStepMoreProps) => {
    const history = useHistory();

    const redirect = useCallback(() => {
        history.push(route);
        onClick!();

        trackEvent(
            TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
            'benefits_modal_section_opened_' + id,
        );
    }, [route, onClick]);

    return (
        <a
            className={`TrialBenefitsModalStepMore ${styleLink ? '' : 'learn-more-button'}`}
            onClick={redirect}
        >
            {message}
        </a>
    );
};

export default TrialBenefitsModalStepMore;
