// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n';

import BlockableLink from 'components/admin_console/blockable_link';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';
import AlertBanner from 'components/alert_banner';
import useGetSubscription from 'components/common/hooks/useGetSubscription';

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
                <FormattedMessage
                    id='admin.billing.subscription.creditCardHasExpired.description'
                    defaultMessage='Please <link>update your payment information</link> to avoid any disruption.'
                    values={{
                        link: (text: string) => <BlockableLink to='/admin_console/billing/payment_info'>{text}</BlockableLink>,
                    }}
                />
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
                <FormattedMessage
                    id='billing.subscription.info.mostRecentPaymentFailed.description.mostRecentPaymentFailed'
                    defaultMessage='It looks your most recent payment failed because the credit card on your account has expired. Please  <link>update your payment information</link> to avoid any disruption.'
                    values={{
                        link: (text: string) => <BlockableLink to='/admin_console/billing/payment_info'>{text}</BlockableLink>,
                    }}
                />
            }
        />
    );
};

interface GrandfatheredPlanBannerProps {
    setShowGrandfatheredPlanBanner: (value: boolean) => void;
}

export const GrandfatheredPlanBanner = (props: GrandfatheredPlanBannerProps) => {
    const openPricingModal = useOpenPricingModal();
    const openSalesLink = useOpenSalesLink();
    const subscription = useGetSubscription();
    if (!subscription) {
        return null;
    }

    let message = {
        id: t('admin.billing.subscription.grandfatheredBannerBody'),
        defaultMessage:
            'Your workspace will update to the current Cloud Starter plan on November 1, 2022. You may lose access to some Enterprise features. Contact Sales to learn more or to subscribe to the Enterprise plan today.',
    };

    if (subscription.is_legacy_cloud_paid_tier) {
        message = {
            id: t('admin.billing.subscription.grandfatheredPayingBannerBody'),
            defaultMessage: 'Your workspace will update to the current Cloud Enterprise plan ($30 / user) on November 1, 2022. Your grandfathered $10 legacy plan is set to expire November 1, 2022. You can downgrade to Professional by viewing the current plans.',
        };
    }

    return (
        <AlertBanner
            mode='info'
            hideIcon={true}
            title={
                <FormattedMessage
                    id='admin.billing.subscription.grandfatheredBannerTitle'
                    defaultMessage='Workspace Update'
                />
            }
            onDismiss={() => props.setShowGrandfatheredPlanBanner(false)}
            message={
                <FormattedMessage
                    {...message}
                />
            }
            actionButtonLeft={
                <button
                    onClick={() => openPricingModal({callerInfo: 'grandfathered_plan_banner'})}
                    className='AlertBanner__buttonLeft'
                >
                    <FormattedMessage
                        id='workspace_limits.modals.view_plans'
                        defaultMessage={'View plans'}
                    />
                </button>
            }
            actionButtonRight={
                <button
                    onClick={openSalesLink}
                    className='AlertBanner__buttonRight'
                >
                    <FormattedMessage
                        id='admin.billing.subscription.privateCloudCard.contactSalesy'
                        defaultMessage={
                            'Contact sales'
                        }
                    />
                </button>
            }
        />
    );
};
