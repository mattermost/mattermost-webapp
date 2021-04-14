// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useDispatch, useStore, useSelector} from 'react-redux';

import {getStandardAnalytics} from 'mattermost-redux/actions/admin';
import {getCloudSubscription, getCloudProducts, getCloudCustomer} from 'mattermost-redux/actions/cloud';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {DispatchFunc} from 'mattermost-redux/types/actions';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import {getCloudContactUsLink, InquiryType, InquiryIssue} from 'selectors/cloud';
import {GlobalState} from 'types/store';
import {
    Preferences,
    CloudBanners,
    TELEMETRY_CATEGORIES,
} from 'utils/constants';
import {isCustomerCardExpired} from 'utils/cloud_utils';
import {getRemainingDaysFromFutureTimestamp} from 'utils/utils.jsx';

import BillingSummary from '../billing_summary';
import PlanDetails from '../plan_details';

import {
    contactSalesCard,
    cancelSubscription,
    infoBanner,
    creditCardExpiredBanner,
    paymentFailedBanner,
} from './billing_subscriptions';

import './billing_subscriptions.scss';

const WARNING_THRESHOLD = 3;

type Props = {
};

const BillingSubscriptions: React.FC<Props> = () => {
    const dispatch = useDispatch<DispatchFunc>();
    const store = useStore();
    const userLimit = useSelector((state: GlobalState) => parseInt(getConfig(state).ExperimentalCloudUserLimit!, 10));
    const analytics = useSelector((state: GlobalState) => state.entities.admin.analytics);
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    const isCloud = useSelector((state: GlobalState) => getLicense(state).Cloud === 'true');
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);

    const products = useSelector((state: GlobalState) => state.entities.cloud.products);
    const isCardExpired = useSelector((state: GlobalState) => isCustomerCardExpired(state.entities.cloud.customer));
    const getCategory = makeGetCategory();
    const preferences = useSelector<GlobalState, PreferenceType[]>((state) => getCategory(state, Preferences.ADMIN_CLOUD_UPGRADE_PANEL));

    const contactSalesLink = useSelector((state: GlobalState) => getCloudContactUsLink(state, InquiryType.Sales));
    const cancelAccountLink = useSelector((state: GlobalState) => getCloudContactUsLink(state, InquiryType.Sales, InquiryIssue.CancelAccount));

    const [showCreditCardBanner, setShowCreditCardBanner] = useState(true);

    let isFreeTrial = false;
    let daysLeftOnTrial = 0;
    if (subscription?.is_free_trial === 'true') {
        isFreeTrial = true;
        daysLeftOnTrial = getRemainingDaysFromFutureTimestamp(subscription.trial_end_at);
    }

    useEffect(() => {
        getCloudSubscription()(dispatch, store.getState());
        getCloudProducts()(dispatch, store.getState());
        getCloudCustomer()(dispatch, store.getState());

        if (!analytics) {
            (async function getAllAnalytics() {
                await dispatch(getStandardAnalytics());
            }());
        }

        pageVisited('cloud_admin', 'pageview_billing_subscription');

        if (analytics && shouldShowInfoBanner()) {
            trackEvent(TELEMETRY_CATEGORIES.CLOUD_ADMIN, 'bannerview_user_limit_warning');
        }
    }, []);

    const shouldShowInfoBanner = (): boolean => {
        if (!analytics || !isCloud || !userLimit || !preferences || !subscription || subscription.is_paid_tier === 'true' || preferences.some((pref: PreferenceType) => pref.name === CloudBanners.HIDE && pref.value === 'true')) {
            return false;
        }

        if ((userLimit - Number(analytics.TOTAL_USERS)) <= WARNING_THRESHOLD && (userLimit - Number(analytics.TOTAL_USERS) > 0)) {
            return true;
        }

        return false;
    };

    const shouldShowPaymentFailedBanner = () => {
        return subscription?.last_invoice?.status === 'failed';
    };

    const handleHide = async () => {
        trackEvent(
            TELEMETRY_CATEGORIES.CLOUD_ADMIN,
            'click_close_banner_user_limit_warning',
        );
        dispatch(savePreferences(currentUser.id, [
            {
                category: Preferences.ADMIN_CLOUD_UPGRADE_PANEL,
                user_id: currentUser.id,
                name: CloudBanners.HIDE,
                value: 'true',
            },
        ]));
    };

    if (!subscription || !products) {
        return null;
    }

    const isPaidTier = Boolean(subscription?.is_paid_tier === 'true');

    return (
        <div className='wrapper--fixed BillingSubscriptions'>
            <FormattedAdminHeader
                id='admin.billing.subscription.title'
                defaultMessage='Subscriptions'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    {shouldShowPaymentFailedBanner() && paymentFailedBanner()}
                    {shouldShowInfoBanner() && infoBanner(handleHide)}
                    {showCreditCardBanner && isCardExpired && creditCardExpiredBanner(setShowCreditCardBanner)}
                    <div className='BillingSubscriptions__topWrapper'>
                        <PlanDetails
                            isFreeTrial={isFreeTrial}
                        />
                        <BillingSummary
                            isPaidTier={isPaidTier}
                            isFreeTrial={isFreeTrial}
                            daysLeftOnTrial={daysLeftOnTrial}
                        />
                    </div>
                    {contactSalesCard(contactSalesLink, isFreeTrial)}
                    {cancelSubscription(cancelAccountLink, isFreeTrial, isPaidTier)}
                </div>
            </div>
        </div>
    );
};

export default BillingSubscriptions;
