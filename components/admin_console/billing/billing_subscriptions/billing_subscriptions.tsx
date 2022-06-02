// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import BlockableLink from 'components/admin_console/blockable_link';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';
import AlertBanner from 'components/alert_banner';

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

interface StarterUpgradeBannerProps {
    planName: React.ReactNode;
    onDismiss: () => void;
}

export const StarterUpgradeBanner = (props: StarterUpgradeBannerProps) => {
    return (
        <AlertBanner
            mode='danger'
            title={
                <FormattedMessage
                    id='workspace_limits.banner_upgrade'
                    defaultMessage='Upgrade to one of our paid plans to avoid {planName} plan data limits'
                    values={{
                        planName: props.planName,
                    }}
                />
            }
            message={
                <FormattedMessage
                    id='workspace_limits.banner_upgrade_reason'
                    defaultMessage='Your workspace has exceeded {planName} plan data limits. Upgrade to one of our paid plans with no limits.'
                    values={{
                        planName: props.planName,
                    }}
                />
            }
            onDismiss={props.onDismiss}
        >
            {'asdf'}
        </AlertBanner>
    );
};

interface GrandfatheredPlanBannerProps {
    setShowGrandfatheredPlanBanner: (value: boolean) => void;
}

export const GrandfatheredPlanBanner = (props: GrandfatheredPlanBannerProps) => {
    const openPricingModal = useOpenPricingModal();
    const openSalesLink = useOpenSalesLink();
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
                    id='admin.billing.subscription.grandfatheredBannerBody'
                    defaultMessage='Your workspace will update to the current Cloud Starter plan on November 1, 2022. You may lose access to some Enterprise features. Contact Sales to learn more or to subscribe to the Enterprise plan today.'
                />
            }
            actionButtonLeft={
                <button
                    onClick={openPricingModal}
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
