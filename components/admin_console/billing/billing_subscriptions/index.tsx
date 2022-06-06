// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useDispatch, useStore, useSelector} from 'react-redux';

import {getStandardAnalytics} from 'mattermost-redux/actions/admin';
import {getCloudSubscription, getCloudProducts, getCloudCustomer} from 'mattermost-redux/actions/cloud';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import PurchaseModal from 'components/purchase_modal';

import {getCloudContactUsLink, InquiryType, SalesInquiryIssue} from 'selectors/cloud';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {
    getSubscriptionProduct,
    getCloudSubscription as selectCloudSubscription,
    checkSubscriptionIsLegacyFree,
} from 'mattermost-redux/selectors/entities/cloud';
import {GlobalState} from 'types/store';
import {
    ModalIdentifiers,
    TrialPeriodDays,
} from 'utils/constants';
import {isCustomerCardExpired} from 'utils/cloud_utils';
import {getRemainingDaysFromFutureTimestamp} from 'utils/utils';
import {useQuery} from 'utils/http_utils';

import BillingSummary from '../billing_summary';
import PlanDetails from '../plan_details';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';

import ContactSalesCard from './contact_sales_card';
import CancelSubscription from './cancel_subscription';
import Limits from './limits';

// keep verbiage until used in follow up work to avoid translations churn.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import _ from './translations';

import {
    creditCardExpiredBanner,
    paymentFailedBanner,
    GrandfatheredPlanBanner,
} from './billing_subscriptions';

import './billing_subscriptions.scss';

const BillingSubscriptions: React.FC = () => {
    const dispatch = useDispatch<DispatchFunc>();
    const store = useStore();
    const analytics = useSelector((state: GlobalState) => state.entities.admin.analytics);
    const subscription = useSelector(selectCloudSubscription);

    const isCardExpired = useSelector((state: GlobalState) => isCustomerCardExpired(state.entities.cloud.customer));

    const contactSalesLink = useSelector((state: GlobalState) => getCloudContactUsLink(state, InquiryType.Sales));
    const cancelAccountLink = useSelector((state: GlobalState) => getCloudContactUsLink(state, InquiryType.Sales, SalesInquiryIssue.CancelAccount));
    const trialQuestionsLink = useSelector((state: GlobalState) => getCloudContactUsLink(state, InquiryType.Sales, SalesInquiryIssue.TrialQuestions));
    const isLegacyFree = useSelector(checkSubscriptionIsLegacyFree);
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);

    const [showCreditCardBanner, setShowCreditCardBanner] = useState(true);
    const [showGrandfatheredPlanBanner, setShowGrandfatheredPlanBanner] = useState(true);

    const query = useQuery();
    const actionQueryParam = query.get('action');

    const product = useSelector(getSubscriptionProduct);

    const openPricingModal = useOpenPricingModal();

    // show the upgrade section when is a free tier customer
    const onUpgradeMattermostCloud = () => {
        trackEvent('cloud_admin', 'click_upgrade_mattermost_cloud');
        openPricingModal();
    };

    let isFreeTrial = false;
    let daysLeftOnTrial = 0;
    if (subscription?.is_free_trial === 'true') {
        isFreeTrial = true;
        daysLeftOnTrial = getRemainingDaysFromFutureTimestamp(subscription.trial_end_at);
        const maxDays = isCloudFreeEnabled ? TrialPeriodDays.TRIAL_30_DAYS : TrialPeriodDays.TRIAL_14_DAYS;
        if (daysLeftOnTrial > maxDays) {
            daysLeftOnTrial = maxDays;
        }
    }

    useEffect(() => {
        getCloudSubscription()(dispatch, store.getState());
        const includeLegacyProducts = true;
        getCloudProducts(includeLegacyProducts)(dispatch, store.getState());
        getCloudCustomer()(dispatch, store.getState());

        if (!analytics) {
            (async function getAllAnalytics() {
                await dispatch(getStandardAnalytics());
            }());
        }

        pageVisited('cloud_admin', 'pageview_billing_subscription');

        if (actionQueryParam === 'show_purchase_modal') {
            onUpgradeMattermostCloud();
        }

        if (actionQueryParam === 'show_pricing_modal') {
            openPricingModal();
        }
    }, []);

    const shouldShowPaymentFailedBanner = () => {
        return subscription?.last_invoice?.status === 'failed';
    };

    if (!subscription || !product) {
        return null;
    }

    const shouldShowGrandfatheredPlanBanner = () => {
        // Give preference to the payment failed banner
        return (
            !shouldShowPaymentFailedBanner() &&
            showGrandfatheredPlanBanner &&

            // This banner is only for this specific grandfathered subscription type.
            isLegacyFree
        );
    };

    return (
        <div className='wrapper--fixed BillingSubscriptions'>
            <FormattedAdminHeader
                id='admin.billing.subscription.title'
                defaultMessage='Subscription'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    {shouldShowPaymentFailedBanner() && paymentFailedBanner()}
                    {shouldShowGrandfatheredPlanBanner() && (
                        <GrandfatheredPlanBanner
                            setShowGrandfatheredPlanBanner={(value: boolean) =>
                                setShowGrandfatheredPlanBanner(value)
                            }
                        />
                    )}
                    {showCreditCardBanner &&
                        isCardExpired &&
                        creditCardExpiredBanner(setShowCreditCardBanner)}
                    <div className='BillingSubscriptions__topWrapper'>
                        <PlanDetails
                            isFreeTrial={isFreeTrial}
                            subscriptionPlan={product?.sku}
                        />
                        <BillingSummary
                            isLegacyFree={isLegacyFree}
                            isFreeTrial={isFreeTrial}
                            daysLeftOnTrial={daysLeftOnTrial}
                            onUpgradeMattermostCloud={onUpgradeMattermostCloud}
                        />
                    </div>
                    {isCloudFreeEnabled ? (
                        <Limits/>
                    ) : (
                        <ContactSalesCard
                            contactSalesLink={contactSalesLink}
                            isFreeTrial={isFreeTrial}
                            trialQuestionsLink={trialQuestionsLink}
                            subscriptionPlan={product?.sku}
                            onUpgradeMattermostCloud={onUpgradeMattermostCloud}
                        />
                    )}
                    <CancelSubscription
                        cancelAccountLink={cancelAccountLink}
                        isFreeTrial={isFreeTrial}
                        isLegacyFree={isLegacyFree}
                    />
                </div>
            </div>
        </div>
    );
};

export default BillingSubscriptions;
