// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {getCurrentLocale} from 'selectors/i18n';
import {GlobalState} from 'types/store';

import {seatsAndSubscriptionDates, getPlanDetailElements, planDetailsTopElements, currentPlanText, featureList} from './plan_details_jsx_pieces';

import './plan_details.scss';

type PlanDetailsProps = {
    isPaidTierWithFreeTrial: boolean;
}
/* eslint-disable react/prop-types */
const PlanDetails: React.FC<PlanDetailsProps> = ({isPaidTierWithFreeTrial}) => {
    const locale = useSelector((state: GlobalState) => getCurrentLocale(state));
    const userCount = useSelector((state: GlobalState) => state.entities.admin.analytics!.TOTAL_USERS) as number;
    const userLimit = parseInt(useSelector((state: GlobalState) => getConfig(state).ExperimentalCloudUserLimit) || '0', 10);
    const aboveUserLimit = userLimit + 1;
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const product = useSelector((state: GlobalState) => {
        if (state.entities.cloud.products && subscription) {
            return state.entities.cloud.products[subscription?.product_id];
        }
        return undefined;
    });

    if (!subscription || !product) {
        return null;
    }

    const showSeatsAndSubscriptionDates = false;

    const {
        planPricing,
        planDetailsDescription,
    } = getPlanDetailElements(subscription, userLimit, userCount, product, aboveUserLimit);

    const isPaidTier = Boolean(subscription?.is_paid_tier === 'true');

    return (
        <div className='PlanDetails'>
            {planDetailsTopElements(userCount, isPaidTier, isPaidTierWithFreeTrial, userLimit)}
            {planPricing}
            {showSeatsAndSubscriptionDates && seatsAndSubscriptionDates(locale, userCount, subscription.seats, new Date(subscription.start_at), new Date(subscription.end_at))}
            {planDetailsDescription}
            <div className='PlanDetails__teamAndChannelCount'>
                <FormattedMessage
                    id='admin.billing.subscription.planDetails.features.unlimitedTeamsAndChannels'
                    defaultMessage='Unlimited teams, channels, and search history'
                />
            </div>
            {featureList(isPaidTierWithFreeTrial, isPaidTier)}
            {currentPlanText(isPaidTierWithFreeTrial)}
        </div>
    );
};

export default PlanDetails;
