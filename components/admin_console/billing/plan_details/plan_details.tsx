// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {CloudProducts} from 'utils/constants';

import Badge from 'components/widgets/badges/badge';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';

import './plan_details.scss';

type Props = {
    userCount: number;
    isFreeTrial: boolean;
    subscriptionPlan: string | undefined;
    daysLeftOnTrial: number;
};

export const PlanDetailsTopElements = ({
    userCount,
    isFreeTrial,
    subscriptionPlan,
    daysLeftOnTrial,
}: Props) => {
    let productName;
    const openPricingModal = useOpenPricingModal();
    const intl = useIntl();

    const userCountDisplay = (
        <div className='PlanDetails__userCount'>
            <FormattedMessage
                id='admin.billing.subscription.planDetails.userCount'
                defaultMessage='{userCount} users'
                values={{userCount}}
            />
        </div>
    );
    switch (subscriptionPlan) {
    case CloudProducts.PROFESSIONAL:
        productName = (
            <FormattedMessage
                id='admin.billing.subscription.planDetails.productName.cloudProfessional'
                defaultMessage='Cloud Professional'
            />
        );
        break;
    case CloudProducts.ENTERPRISE:
        productName = (
            <FormattedMessage
                id='admin.billing.subscription.planDetails.productName.cloudEnterprise'
                defaultMessage='Cloud Enterprise'
            />
        );
        break;
    case CloudProducts.STARTER:
        productName = (
            <FormattedMessage
                id='admin.billing.subscription.planDetails.productName.cloudFree'
                defaultMessage='Cloud Free'
            />
        );
        break;
    default:
        productName = (
            <FormattedMessage
                id='admin.billing.subscription.planDetails.productName.unknown'
                defaultMessage='Unknown product'
            />
        );
        break;
    }

    const trialBadge = (
        <Badge
            className='TrialBadge'
            show={isFreeTrial}
        >
            <FormattedMessage
                id='admin.billing.subscription.cloudTrialBadge.daysLeftOnTrial'
                defaultMessage='{daysLeftOnTrial} trial days left'
                values={{daysLeftOnTrial}}
            />
        </Badge>
    );

    const viewPlansButton = (
        <button
            onClick={() => openPricingModal({trackingLocation: 'billing_plan_details_view_plans'})}
            className='btn btn-secondary PlanDetails__viewPlansButton'
        >
            {intl.formatMessage({
                id: 'workspace_limits.menu_limit.view_plans',
                defaultMessage: 'View plans',
            })}
        </button>
    );

    return (
        <>
            <div className='PlanDetails__top'>
                <div className='PlanDetails__productName'>
                    {productName} {trialBadge}
                </div>

                {viewPlansButton}
            </div>
            {userCountDisplay}
        </>
    );
};

export const currentPlanText = (isFreeTrial: boolean) => {
    if (isFreeTrial) {
        return null;
    }
    return (
        <div className='PlanDetails__currentPlan'>
            <i className='icon-check-circle'/>
            <FormattedMessage
                id='admin.billing.subscription.planDetails.currentPlan'
                defaultMessage='Current Plan'
            />
        </div>
    );
};
