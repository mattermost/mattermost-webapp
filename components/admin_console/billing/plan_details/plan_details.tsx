// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {CloudProducts} from 'utils/constants';

import Badge from 'components/widgets/badges/badge';

import './plan_details.scss';

export const planDetailsTopElements = (
    userCount: number,
    isLegacyFree: boolean,
    isFreeTrial: boolean,
    subscriptionPlan: string | undefined,
) => {
    let userCountDisplay;
    let productName;

    if (isLegacyFree) {
        productName = (
            <FormattedMessage
                id='admin.billing.subscription.planDetails.productName.mmCloud'
                defaultMessage='Mattermost Cloud'
            />
        );
    } else {
        userCountDisplay = (
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
                    id='admin.billing.subscription.planDetails.productName.cloudStarter'
                    defaultMessage='Cloud Starter'
                />
            );
            break;
        default:
            // must be CloudProducts.LEGACY
            productName = (
                <FormattedMessage
                    id='admin.billing.subscription.planDetails.productName.mmCloud'
                    defaultMessage='Mattermost Cloud'
                />
            );
            break;
        }
    }

    const trialBadge = (
        <Badge
            className='TrialBadge'
            show={isFreeTrial}
        >
            <FormattedMessage
                id='admin.cloud.import.header.TrialBadge'
                defaultMessage='Trial'
            />
        </Badge>
    );

    return (
        <div className='PlanDetails__top'>
            <div className='PlanDetails__productName'>
                {productName} {trialBadge}
            </div>
            {userCountDisplay}
        </div>
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
