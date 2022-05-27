// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {trackEvent} from 'actions/telemetry_actions';
import {BillingSchemes, CloudProducts} from 'utils/constants';
import {Product} from '@mattermost/types/cloud';
import {CloudLinks} from 'utils/constants';

import './plan_pricing.scss';

interface Props {
    isPaidTier: boolean;
    product: Product;
}
const PlanPricing = ({
    isPaidTier,
    product,
}: Props) => {
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);

    let planPricing;

    if (isPaidTier) {
        planPricing = (
            <div className='PlanPricing'>
                <div className='PlanDetails__paid-tier'>
                    {`$${product.price_per_seat.toFixed(2)}`}
                    {product.billing_scheme === BillingSchemes.FLAT_FEE ? (
                        <FormattedMessage
                            id='admin.billing.subscription.planDetails.flatFeePerMonth'
                            defaultMessage='/month (Unlimited Users). '
                        />
                    ) : (
                        <FormattedMessage
                            id='admin.billing.subscription.planDetails.perUserPerMonth'
                            defaultMessage='/user/month. '
                        />) }
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href={CloudLinks.BILLING_DOCS}
                        onClick={() => trackEvent('cloud_admin', 'click_how_billing_works', {screen: 'payment'})}
                    >
                        <FormattedMessage
                            id='admin.billing.subscription.planDetails.howBillingWorks'
                            defaultMessage='See how billing works'
                        />
                    </a>
                </div>
            </div>
        );
    } else {
        planPricing = (
            <div className='PlanDetails__plan'>
                <div className='PlanDetails__planName'>
                    <FormattedMessage
                        id='admin.billing.subscription.planDetails.tiers.free'
                        defaultMessage='Free'
                    />
                </div>
            </div>
        );
    }

    if (isCloudFreeEnabled && product.sku === CloudProducts.STARTER) {
        return null;
    }

    return planPricing;
};

export default PlanPricing;
