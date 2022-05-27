// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedDate, FormattedMessage, useIntl} from 'react-intl';
import classNames from 'classnames';

import {trackEvent} from 'actions/telemetry_actions';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {getMonthLong} from 'utils/i18n';
import {BillingSchemes, CloudLinks, CloudProducts} from 'utils/constants';
import {fallbackStarterLimits, asGBString} from 'utils/limits';
import useGetLimits from 'components/common/hooks/useGetLimits';

import Badge from 'components/widgets/badges/badge';

import './plan_details.scss';
import {Product} from '@mattermost/types/cloud';

const howBillingWorksLink = (
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
);

export const seatsAndSubscriptionDates = (locale: string, userCount: number, numberOfSeats: number, startDate: Date, endDate: Date) => {
    return (
        <div className='PlanDetails__seatsAndSubscriptionDates'>
            <div className='PlanDetails__seats'>
                <div className='PlanDetails__seats-total'>
                    <FormattedMessage
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
                    <FormattedMessage
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
                                        <FormattedMessage
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
    subscriptionPlan: string | undefined,
) => {
    let userCountDisplay;
    let productName;

    if (isPaidTier) {
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
        case CloudProducts.STARTER_LEGACY:
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
    } else {
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

export const getPlanPricing = (
    isPaidTier: boolean,
    product: Product,
) => {
    let planPricing;

    if (isPaidTier) {
        planPricing = (
            <div className='PlanDetails__plan'>
                <div className='PlanDetails_paidTier__planName'>
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
                    {howBillingWorksLink}
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

    return planPricing;
};

interface FeatureListProps {
    subscriptionPlan?: string;
    isPaidTier: boolean;
}

export const FeatureList = (props: FeatureListProps) => {
    const intl = useIntl();
    const [limits] = useGetLimits();
    const featuresFreeTier = [
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.10GBstoragePerUser',
            defaultMessage: '10 GB storage per user',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.99uptime',
            defaultMessage: '99.0% uptime',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.selfServiceDocumentation',
            defaultMessage: 'Self-Service documentation and forum support',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.mfaAuthentication',
            defaultMessage: 'Google, GitLab, O365 & MFA Authentication',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.guestAccounts',
            defaultMessage: 'Guest Accounts',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.unlimitedIntegrations',
            defaultMessage: 'Unlimited Integrations',
        }),
    ];

    const featuresCloudStarter = [
        intl.formatMessage(
            {
                id: 'admin.billing.subscription.planDetails.features.limitedMessageHistory',
                defaultMessage: 'Limited to a message history of {limit} messages',
            },
            {
                limit: intl.formatNumber(limits.messages?.history ?? fallbackStarterLimits.messages.history),
            },
        ),
        intl.formatMessage(
            {
                id: 'admin.billing.subscription.planDetails.features.limitedIntegrationsEnabled',
                defaultMessage: 'Limited to {limit} Apps and Plugins',
            },
            {
                limit: intl.formatNumber(limits.integrations?.enabled ?? fallbackStarterLimits.integrations.enabled),
            },
        ),
        intl.formatMessage(
            {
                id: 'admin.billing.subscription.planDetails.features.limitedFileStorage',
                defaultMessage: 'Limited to {limit} File Storage',
            },
            {

                limit: asGBString(limits.files?.total_storage ?? fallbackStarterLimits.files.totalStorage, intl.formatNumber),
            },
        ),
        intl.formatMessage(
            {
                id: 'admin.billing.subscription.planDetails.features.limitedBoardCards',
                defaultMessage: 'Limited to {limit} board cards per workspace',
            },
            {

                limit: intl.formatNumber(limits.boards?.cards ?? fallbackStarterLimits.boards.cards),
            },
        ),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.groupAndOneToOneMessaging',
            defaultMessage: 'Group and one-to-one messaging, file sharing, and search',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.incidentCollaboration',
            defaultMessage: 'Incident collaboration',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.unlimitedUsers',
            defaultMessage: 'Unlimited users',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.mfa',
            defaultMessage: 'Multi-Factor Authentication (MFA)',
        }),
    ];

    const featuresCloudStarterLegacy = [
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.groupAndOneToOneMessaging',
            defaultMessage: 'Group and one-to-one messaging, file sharing, and search',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.incidentCollaboration',
            defaultMessage: 'Incident collaboration',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.unlimittedUsersAndMessagingHistory',
            defaultMessage: 'Unlimited users & message history',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.mfa',
            defaultMessage: 'Multi-Factor Authentication (MFA)',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.multilanguage',
            defaultMessage: 'Multi-language translations',
        }),
    ];

    const featuresCloudProfessional = [
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.advanceTeamPermission',
            defaultMessage: 'Advanced team permissions',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.mfaEnforcement',
            defaultMessage: 'MFA enforcement',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.multiplatformSso',
            defaultMessage: 'GitLab, Google, and O365 single sign-on',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.guestAccounts',
            defaultMessage: 'Guest Accounts',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.channelModeration',
            defaultMessage: 'Channel moderation',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.readOnlyChannels',
            defaultMessage: 'Read-only announcement channels',
        }),
    ];

    const featuresCloudEnterprise = [
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.enterpriseAdminAndSso',
            defaultMessage: 'Enterprise administration & SSO',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.autoComplianceExports',
            defaultMessage: 'Automated compliance exports',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.customRetentionPolicies',
            defaultMessage: 'Custom data retention policies',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.sharedChannels',
            defaultMessage: 'Shared channels (coming soon)',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.ldapSync',
            defaultMessage: 'AD/LDAP group sync to teams & channels',
        }),
        intl.formatMessage({
            id: 'admin.billing.subscription.planDetails.features.premiumSupport',
            defaultMessage: 'Premium Support (optional upgrade)',
        }),
    ];

    let features;

    if (props.isPaidTier) {
        switch (props.subscriptionPlan) {
        case CloudProducts.PROFESSIONAL:
            features = featuresCloudProfessional;
            break;

        case CloudProducts.STARTER:
            features = featuresCloudStarter;
            break;
        case CloudProducts.STARTER_LEGACY:
            features = featuresCloudStarterLegacy;
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

    const featureElements = features?.map((feature, i) => (
        <div
            key={`PlanDetails__feature${i.toString()}`}
            className='PlanDetails__feature'
        >
            <i className='icon-check'/>
            <span>{feature}</span>
        </div>
    ));

    return <>{featureElements}</>;
};
