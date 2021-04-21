// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';

import BlockableLink from 'components/admin_console/blockable_link';
import AlertBanner from 'components/alert_banner';

import privateCloudImage from 'images/private-cloud-image.svg';

export const contactSalesCard = (contactSalesLink: any, isFreeTrial: boolean) => {
    let title;
    let description;

    if (isFreeTrial) {
        title = (
            <FormattedMessage
                id='admin.billing.subscription.privateCloudCard.freeTrial.title'
                defaultMessage='Questions about your trial?'
            />
        );
        description = (
            <FormattedMessage
                id='admin.billing.subscription.privateCloudCard.freeTrial.description'
                defaultMessage='We love to work with our customers and their needs. Contact sales for subscription, billing or trial-specific questions.'
            />
        );
    } else {
        title = (
            <FormattedMessage
                id='admin.billing.subscription.privateCloudCard.cloudProfessional.title'
                defaultMessage='Upgrade to Cloud Enterprise'
            />
        );
        description = (
            <FormattedMessage
                id='admin.billing.subscription.privateCloudCard.cloudProfessional.description'
                defaultMessage='Optimize your processes with VPC Peering, a dedicated AWS account and premium support.'
            />
        );
    }

    return (
        <div className='PrivateCloudCard'>
            <div className='PrivateCloudCard__text'>
                <div className='PrivateCloudCard__text-title'>
                    {title}
                    {/* {typeSubscription === 'CLOUD_STARTER' &&
                        <FormattedMessage
                            id='admin.billing.subscription.privateCloudCard.cloudStarter.title'
                            defaultMessage='Upgrade to Cloud Professional'
                        />
                    }

                    {typeSubscription === 'CLOUD_PROFESSIONAL' &&
                        <FormattedMessage
                            id='admin.billing.subscription.privateCloudCard.cloudProfessional.title'
                            defaultMessage='Upgrade to Cloud Enterprise'
                        />
                    }

                    {typeSubscription === 'CLOUD_ENTERPRISE' &&
                        <FormattedMessage
                            id='admin.billing.subscription.privateCloudCard.cloudEnterprise.title'
                            defaultMessage='Looking for an annual discount? '
                        />
                    } */}
                </div>
                <div className='PrivateCloudCard__text-description'>
                    {description}
                    {/* {typeSubscription === 'CLOUD_STARTER' && <FormattedMessage
                        id='admin.billing.subscription.privateCloudCard.cloudStarter.description'
                        defaultMessage='Optimize your processes with Guest Accounts, Office365 suite integrations, Gitlab SSO and advanced permissions.'
                    />}
                    {typeSubscription === 'CLOUD_PROFESSIONAL' && <FormattedMessage
                        id='admin.billing.subscription.privateCloudCard.cloudProfessional.description'
                        defaultMessage='Optimize your processes with VPC Peering, a dedicated AWS account and premium support.'
                    />}
                    {typeSubscription === 'CLOUD_ENTERPRISE' && <FormattedMessage
                        id='admin.billing.subscription.privateCloudCard.cloudEnterprise.description'
                        defaultMessage='At Mattermost, we work with you and your team to meet your needs throughout the product. If you are looking for an annual discount, please reach out to our sales team.'
                    />} */}
                </div>
                <a
                    href={contactSalesLink}
                    rel='noopener noreferrer'
                    target='_new'
                    className='PrivateCloudCard__contactSales'
                    onClick={() => trackEvent('cloud_admin', 'click_contact_sales')}
                >
                    <FormattedMessage
                        id='admin.billing.subscription.privateCloudCard.contactSales'
                        defaultMessage='Contact Sales'
                    />
                </a>
            </div>
            <div className='PrivateCloudCard__image'>
                <img src={privateCloudImage}/>
            </div>
        </div>
    );
};

export const cancelSubscription = (cancelAccountLink: any, isFreeTrial: boolean, isPaidTier: boolean) => {
    if (isFreeTrial || !isPaidTier) {
        return null;
    }
    return (
        <div className='cancelSubscriptionSection'>
            <div className='cancelSubscriptionSection__text'>
                <div className='cancelSubscriptionSection__text-title'>
                    <FormattedMessage
                        id='admin.billing.subscription.cancelSubscriptionSection.title'
                        defaultMessage='Cancel your subscription'
                    />
                </div>
                <div className='cancelSubscriptionSection__text-description'>
                    <FormattedMessage
                        id='admin.billing.subscription.cancelSubscriptionSection.description'
                        defaultMessage='At this time, deleting a workspace can only be done with the help of a customer support representative.'
                    />
                </div>
                <a
                    href={cancelAccountLink}
                    rel='noopener noreferrer'
                    target='_new'
                    className='cancelSubscriptionSection__contactUs'
                    onClick={() => trackEvent('cloud_admin', 'click_contact_us')}
                >
                    <FormattedMessage
                        id='admin.billing.subscription.cancelSubscriptionSection.contactUs'
                        defaultMessage='Contact Us'
                    />
                </a>
            </div>
        </div>
    );
};

export const infoBanner = (handleHide: () => void) => {
    return (
        <AlertBanner
            mode='info'
            title={
                <FormattedMessage
                    id='billing.subscription.info.headsup'
                    defaultMessage='Just a heads up'
                />
            }
            message={
                <FormattedMessage
                    id='billing.subscription.info.headsup.description'
                    defaultMessage='You’re nearing the user limit with the free tier of Mattermost Cloud. We’ll let you know if you hit that limit.'
                />
            }
            onDismiss={() => handleHide()}
        />
    );
};

export const creditCardExpiredBanner = (setShowCreditCardBanner: (value: boolean) => void) => {
    return (
        <AlertBanner
            mode='danger'
            title={
                <FormattedMessage
                    id='admin.billing.subscription.creditCardHasExpired'
                    defaultMessage='Your credit card has expired'
                />
            }
            message={
                <>
                    <FormattedMessage
                        id='admin.billing.subscription.creditCardHasExpired.please'
                        defaultMessage='Please '
                    />
                    <BlockableLink
                        to='/admin_console/billing/payment_info'
                    >
                        <FormattedMessage
                            id='admin.billing.subscription.creditCardHasExpired.description.updatePaymentInformation'
                            defaultMessage='update your payment information'
                        />
                    </BlockableLink>
                    <FormattedMessage
                        id='admin.billing.subscription.creditCardHasExpired.description.avoidAnyDisruption'
                        defaultMessage=' to avoid any disruption.'
                    />
                </>
            }
            onDismiss={() => setShowCreditCardBanner(false)}
        />
    );
};

export const paymentFailedBanner = () => {
    return (
        <AlertBanner
            mode='danger'
            title={
                <FormattedMessage
                    id='billing.subscription.info.mostRecentPaymentFailed'
                    defaultMessage='Your most recent payment failed'
                />
            }
            message={
                <>
                    <FormattedMessage
                        id='billing.subscription.info.mostRecentPaymentFailed.description.mostRecentPaymentFailed'
                        defaultMessage='It looks your most recent payment failed because the credit card on your account has expired. Please '
                    />
                    <BlockableLink
                        to='/admin_console/billing/payment_info'
                    >
                        <FormattedMessage
                            id='billing.subscription.info.mostRecentPaymentFailed.description.updatePaymentInformation'
                            defaultMessage='update your payment information'
                        />
                    </BlockableLink>
                    <FormattedMessage
                        id='billing.subscription.info.mostRecentPaymentFailed.description.avoidAnyDisruption'
                        defaultMessage=' to avoid any disruption.'
                    />
                </>
            }
        />
    );
};
