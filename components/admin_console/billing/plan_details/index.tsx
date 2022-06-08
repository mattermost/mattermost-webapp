// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {GlobalState} from 'types/store';

import {checkSubscriptionIsLegacyFree, getSubscriptionProduct, getCloudSubscription} from 'mattermost-redux/selectors/entities/cloud';

import {
    planDetailsTopElements,
    currentPlanText,
} from './plan_details';
import FeatureList from './feature_list';
import PlanPricing from './plan_pricing';

import './plan_details.scss';

type Props = {
    isFreeTrial: boolean;
    subscriptionPlan: string | undefined;
}
const PlanDetails = ({isFreeTrial, subscriptionPlan}: Props) => {
    const userCount = useSelector((state: GlobalState) => state.entities.admin.analytics!.TOTAL_USERS) as number;
    const subscription = useSelector(getCloudSubscription);
    const product = useSelector(getSubscriptionProduct);
    const isLegacyFree = useSelector(checkSubscriptionIsLegacyFree);
    const isLegacyFreePaidTier = Boolean(subscription?.is_legacy_cloud_paid_tier);

    if (!product) {
        return null;
    }

    return (
        <div className='PlanDetails'>
            {planDetailsTopElements(userCount, isLegacyFree, isFreeTrial, subscriptionPlan)}
            <PlanPricing
                isLegacyFree={isLegacyFree}
                isLegacyFreePaidTier={isLegacyFreePaidTier}
                product={product}
            />
            <div className='PlanDetails__teamAndChannelCount'>
                <FormattedMessage
                    id='admin.billing.subscription.planDetails.features.unlimitedTeamsAndChannels'
                    defaultMessage='Unlimited teams, channels, and search history'
                />
            </div>
            <FeatureList
                subscriptionPlan={subscriptionPlan}
                isLegacyFree={isLegacyFree}
            />
            {currentPlanText(isFreeTrial)}
        </div>
    );
};

export default PlanDetails;
