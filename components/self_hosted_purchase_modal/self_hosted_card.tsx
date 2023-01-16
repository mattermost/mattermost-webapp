// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {Product} from '@mattermost/types/cloud';

import {trackEvent} from 'actions/telemetry_actions';

import {Card, ButtonCustomiserClasses} from 'components/purchase_modal/purchase_modal';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';

import {
    SelfHostedProducts,
} from 'utils/constants';

import {seeHowBillingWorks} from './consequences';

// Card has a bunch of props needed for monthly/yearly payments that
// do not apply to self-hosted.
const dummyCardProps = {
    annualSubscription: false,
    usersCount: 0,
    yearlyPrice: 0,
    monthlyPrice: 0,
    isInitialPlanMonthly: false,
    updateIsMonthly: () => {},
    updateInputUserCount: () => {},
    setUserCountError: () => {},
    isCurrentPlanMonthlyProfessional: false,
};

interface Props {
    desiredPlanName: string;
    desiredProduct: Product;
    currentUsers: number;
    canSubmit: boolean;
    submit: () => void;
}

export default function SelfHostedCard(props: Props) {
    const intl = useIntl();
    const openPricingModal = useOpenPricingModal();

    const showPlanLabel = props.desiredProduct.sku === SelfHostedProducts.PROFESSIONAL;

    const comparePlan = (
        <button
            className='ml-1'
            onClick={() => {
                trackEvent('self_hosted_pricing', 'click_compare_plans');
                openPricingModal({trackingLocation: 'purchase_modal_compare_plans_click'});
            }}
        >
            <FormattedMessage
                id='cloud_subscribe.contact_support'
                defaultMessage='Compare plans'
            />
        </button>
    );
    const comparePlanWrapper = (
        <div
            className={showPlanLabel ? 'plan_comparison show_label' : 'plan_comparison'}
        >
            {comparePlan}
        </div>
    );

    return (
        <>
            {comparePlanWrapper}
            <Card
                {...dummyCardProps}
                intl={intl}
                plan={props.desiredPlanName}
                seeHowBillingWorks={seeHowBillingWorks}
                buttonDetails={{
                    action: props.submit,
                    disabled: !props.canSubmit,
                    text: intl.formatMessage({id: 'self_hosted_signup.cta', defaultMessage: 'Upgrade'}),
                    customClass: props.canSubmit ? ButtonCustomiserClasses.special : ButtonCustomiserClasses.grayed,
                }}
            />
        </>
    );
}
