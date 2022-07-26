// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import {TrialPeriodDays} from 'utils/constants';
import {getRemainingDaysFromFutureTimestamp} from 'utils/utils';

import {getCloudSubscription as selectCloudSubscription} from 'mattermost-redux/selectors/entities/cloud';

type PlanLabelProps = {
    text: string;
    bgColor: string;
    color: string;
    firstSvg: JSX.Element;
    secondSvg?: JSX.Element;
}

type StyledProps = {
    bgColor?: string;
    color?: string;
}

const StyledPlanLabel = styled.div<StyledProps>`
background-color: ${(props) => props.bgColor};
color: ${(props) => props.color};
`;

function PlanLabel(props: PlanLabelProps) {
    const {formatMessage} = useIntl();
    const subscription = useSelector(selectCloudSubscription);
    let text = props.text;

    if (subscription?.is_free_trial === 'true') {
        const daysLeftOnTrial = Math.min(
            getRemainingDaysFromFutureTimestamp(subscription.trial_end_at),
            TrialPeriodDays.TRIAL_30_DAYS,
        );
        text = formatMessage({id: 'pricing_modal.plan_label_trialDays', defaultMessage: '{days} DAYS LEFT ON TRIAL'}, {days: daysLeftOnTrial});
    }
    return (
        <StyledPlanLabel
            className='planLabel'
            bgColor={props.bgColor}
            color={props.color}
        >
            {props.firstSvg}
            {text}
            {props.secondSvg}
        </StyledPlanLabel>
    );
}

export default PlanLabel;

