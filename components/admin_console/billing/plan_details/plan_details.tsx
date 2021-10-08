// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedDate, FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {trackEvent} from 'actions/telemetry_actions';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import OverlayTrigger from 'components/overlay_trigger';
import {getMonthLong} from 'utils/i18n';
import {BillingSchemes, CloudLinks, CloudProducts} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import Badge from 'components/widgets/badges/badge';

import './plan_details.scss';
import {Product} from 'mattermost-redux/types/cloud';

const howBillingWorksLink = (
    <a
        target='_new'
        rel='noopener noreferrer'
        href={CloudLinks.BILLING_DOCS}
        onClick={() => trackEvent('cloud_admin', 'click_how_billing_works', {screen: 'payment'})}
    >
        <FormattedMessage
            id='admin.billing.subscription.planDetails.howBillingWorks'
            defaultMessage='See how billing works'
        />
    </a>
);

export const seatsAndSubscriptionDates = (locale: string, userCount: number, numberOfSeats: number, startDate: Date, endDate: Date) => {
    return (
        <div className='PlanDetails__seatsAndSubscriptionDates'>
            <div className='PlanDetails__seats'>
                <div className='PlanDetails__seats-total'>
                    <FormattedMarkdownMessage
                        id='admin.billing.subscription.planDetails.numberOfSeats'
                        defaultMessage='{numberOfSeats} seats'
                        values={{numberOfSeats}}
                    />
                </div>
                <div
                    className={classNames('PlanDetails__seats-registered', {
                        overLimit: userCount > numberOfSeats,
                    })}
                >
                    <FormattedMarkdownMessage
                        id='admin.billing.subscription.planDetails.numberOfSeatsRegistered'
                        defaultMessage='({userCount} currently registered)'
                        values={{userCount}}
                    />
                    {(userCount > numberOfSeats) &&
                        <OverlayTrigger
                            delayShow={500}
                            placement='bottom'
                            overlay={(
                                <Tooltip
                                    id='BillingSubscriptions__seatOverageTooltip'
                                    className='BillingSubscriptions__tooltip BillingSubscriptions__tooltip-left'
                                    positionLeft={390}
                                >
                                    <div className='BillingSubscriptions__tooltipTitle'>
                                        <FormattedMessage
                                            id='admin.billing.subscription.planDetails.seatCountOverages'
                                            defaultMessage='Seat count overages'
                                        />
                                    </div>
                                    <div className='BillingSubscriptions__tooltipMessage'>
                                        <FormattedMarkdownMessage
                                            id='admin.billing.subscription.planDetails.prolongedOverages'
                                            defaultMessage='Prolonged overages may result in additional charges.'
                                        />
                                        {howBillingWorksLink}
                                    </div>
                                </Tooltip>
                            )}
                        >
                            <i className='icon-information-outline'/>
                        </OverlayTrigger>
                    }
                </div>
            </div>
            <div className='PlanDetails__subscriptionDate'>
                <FormattedMessage
                    id='admin.billing.subscription.planDetails.startDate'
                    defaultMessage='Start Date: '
                />
                <FormattedDate
                    value={startDate}
                    day='numeric'
                    month={getMonthLong(locale)}
                    year='numeric'
                />
            </div>
            <div className='PlanDetails__subscriptionDate'>
                <FormattedMessage
                    id='admin.billing.subscription.planDetails.endDate'
                    defaultMessage='End Date: '
                />
                <FormattedDate
                    value={endDate}
                    day='numeric'
                    month={getMonthLong(locale)}
                    year='numeric'
                />
            </div>
        </div>
    );
};

export const planDetailsTopElements = (
    userCount: number,
    isPaidTier: boolean,
    isFreeTrial: boolean,
    userLimit: number,
    subscriptionPlan: string | undefined,
) => {
    let userCountDisplay;
    let productName;

    if (isPaidTier) {
        userCountDisplay = (
            <div className='PlanDetails__userCount'>
                <FormattedMarkdownMessage
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
            userCountDisplay = (
                <div
                    className={classNames('PlanDetails__userCount', {
                        withinLimit: (userLimit - userCount) <= 5,
                        overLimit: userCount > userLimit,
                    })}
                >
                    <FormattedMarkdownMessage
                        id='admin.billing.subscription.planDetails.userCountWithLimit'
                        defaultMessage='{userCount} / {userLimit} users'
                        values={{userCount, userLimit}}
                    />
                </div>
            );
            break;
        }
    } else {
        userCountDisplay = (
            <div
                className={classNames('PlanDetails__userCount', {
                    withinLimit: (userLimit - userCount) <= 5,
                    overLimit: userCount > userLimit,
                })}
            >
                <FormattedMarkdownMessage
                    id='admin.billing.subscription.planDetails.userCountWithLimit'
                    defaultMessage='{userCount} / {userLimit} users'
                    values={{userCount, userLimit}}
                />
            </div>
        );

        productName = (
            <FormattedMessage
                id='admin.billing.subscription.planDetails.productName.mmCloud'
                defaultMessage='Mattermost Cloud'
            />
        );
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

export const getPlanDetailElements = (
    userLimit: number,
    isPaidTier: boolean,
    product: Product,
    aboveUserLimit: number,
) => {
    let planPricing;
    let planDetailsDescription;

    if (isPaidTier) {
        planPricing = (
            <div className='PlanDetails__plan'>
                <div className='PlanDetails_paidTier__planName'>
                    {`$${product.price_per_seat.toFixed(2)}`}
                    {product.billing_scheme === BillingSchemes.FLAT_FEE ?
                        <FormattedMessage
                            id='admin.billing.subscription.planDetails.flatFeePerMonth'
                            defaultMessage='/month (Unlimited Users). '
                        /> :
                        <FormattedMessage
                            id='admin.billing.subscription.planDetails.perUserPerMonth'
                            defaultMessage='/user/month. '
                        />
                    }

                    {howBillingWorksLink}
                </div>
            </div>
        );
        planDetailsDescription = null;
    } else {
        planPricing = (
            <div className='PlanDetails__plan'>
                <div className='PlanDetails__planName'>
                    <FormattedMessage
                        id='admin.billing.subscription.planDetails.tiers.free'
                        defaultMessage='Free'
                    />
                </div>
                <div className='PlanDetails__planCaveat'>
                    <FormattedMarkdownMessage
                        id='admin.billing.subscription.planDetails.upToXUsers'
                        defaultMessage='up to {userLimit} users'
                        values={{userLimit}}
                    />
                </div>
            </div>
        );
        planDetailsDescription = (
            <div className='PlanDetails__description'>
                <div className='PlanDetails__planDetailsName'>
                    {`$${product.price_per_seat.toFixed(2)}`}
                </div>
                <div className='PlanDetails__planDetailsName'>
                    <FormattedMessage
                        id='admin.billing.subscription.planDetails.planDetailsName.freeForXOrMoreUsers'
                        defaultMessage='/user/month for {aboveUserLimit} or more users.'
                        values={{aboveUserLimit}}
                    />
                </div>
                {howBillingWorksLink}
            </div>
        );
    }

    return {
        planPricing,
        planDetailsDescription,
    };
};

export const featureList = (subscriptionPlan: string | undefined, isPaidTier: boolean) => {
    const featuresFreeTier = [
        localizeMessage('admin.billing.subscription.planDetails.features.10GBstoragePerUser', '10 GB storage per user'),
        localizeMessage('admin.billing.subscription.planDetails.features.99uptime', '99.0% uptime'),
        localizeMessage('admin.billing.subscription.planDetails.features.selfServiceDocumentation', 'Self-Service documentation and forum support'),
        localizeMessage('admin.billing.subscription.planDetails.features.mfaAuthentication', 'Google, Gitlab, O365 & MFA Authentication'),
        localizeMessage('admin.billing.subscription.planDetails.features.guestAccounts', 'Guest Accounts'),
        localizeMessage('admin.billing.subscription.planDetails.features.unlimitedIntegrations', 'Unlimited Integrations'),
    ];

    const featuresCloudStarter = [
        localizeMessage('admin.billing.subscription.planDetails.features.groupAndOneToOneMessaging', 'Group and one-to-one messaging, file sharing, and search'),
        localizeMessage('admin.billing.subscription.planDetails.features.incidentCollaboration', 'Incident collaboration'),
        localizeMessage('admin.billing.subscription.planDetails.features.unlimittedUsersAndMessagingHistory', 'Unlimited users & message history'),
        localizeMessage('admin.billing.subscription.planDetails.features.mfa', 'Multi-Factor Authentication (MFA)'),
        localizeMessage('admin.billing.subscription.planDetails.features.multilanguage', 'Multi-language translations'),
    ];

    const featuresCloudProfessional = [
        localizeMessage('admin.billing.subscription.planDetails.features.advanceTeamPermission', 'Advanced team permissions'),
        localizeMessage('admin.billing.subscription.planDetails.features.mfaEnforcement', 'MFA enforcement'),
        localizeMessage('admin.billing.subscription.planDetails.features.multiplatformSso', 'Gitlab, Google, and O365 single sign-on'),
        localizeMessage('admin.billing.subscription.planDetails.features.guestAccounts', 'Guest Accounts'),
        localizeMessage('admin.billing.subscription.planDetails.features.channelModeration', 'Channel moderation'),
        localizeMessage('admin.billing.subscription.planDetails.features.readOnlyChannels', 'Read-only announcement channels'),
    ];

    const featuresCloudEnterprise = [
        localizeMessage('admin.billing.subscription.planDetails.features.enterpriseAdministration', 'Enterprise administration & SSO'),
        localizeMessage('admin.billing.subscription.planDetails.features.autoComplianceExports', 'Automated compliance exports'),
        localizeMessage('admin.billing.subscription.planDetails.features.customRetentionPolicies', 'Custom data retention policies'),
        localizeMessage('admin.billing.subscription.planDetails.features.sharedChannels', 'Shared channels (coming soon)'),
        localizeMessage('admin.billing.subscription.planDetails.features.enterpriseAdminSso', 'Enterprise administration & SSO'),
        localizeMessage('admin.billing.subscription.planDetails.features.premiumSupport', 'Premium Support (optional upgrade)'),
    ];

    let features;

    if (isPaidTier) {
        switch (subscriptionPlan) {
        case CloudProducts.PROFESSIONAL:
            features = featuresCloudProfessional;
            break;

        case CloudProducts.STARTER:
            features = featuresCloudStarter;
            break;
        case CloudProducts.ENTERPRISE:
            features = featuresCloudEnterprise;
            break;
        default:
            // must be CloudProducts.LEGACY
            features = featuresFreeTier;
            break;
        }
    } else {
        features = featuresFreeTier;
    }

    return features?.map((feature, i) => (
        <div
            key={`PlanDetails__feature${i}`}
            className='PlanDetails__feature'
        >
            <i className='icon-check'/>
            <span>{feature}</span>
        </div>
    ));
};
