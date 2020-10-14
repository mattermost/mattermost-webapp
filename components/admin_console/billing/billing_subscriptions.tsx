// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useDispatch, useStore, useSelector} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';

import {getStandardAnalytics} from 'mattermost-redux/actions/admin';
import {getCloudSubscription, getCloudProducts} from 'mattermost-redux/actions/cloud';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {DispatchFunc} from 'mattermost-redux/types/actions';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import AlertBanner from 'components/alert_banner';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import PurchaseModal from 'components/purchase_modal';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';
import {GlobalState} from 'types/store';
import {
    Preferences,
    CloudBanners,
    ModalIdentifiers,
    TELEMETRY_CATEGORIES,
} from 'utils/constants';

import privateCloudImage from 'images/private-cloud-image.svg';
import upgradeMattermostCloudImage from 'images/upgrade-mattermost-cloud-image.svg';

import BillingSummary from './billing_summary';
import PlanDetails from './plan_details';

import './billing_subscriptions.scss';

const WARNING_THRESHOLD = 3;

type Props = {
};

const BillingSubscriptions: React.FC<Props> = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch<DispatchFunc>();
    const store = useStore();
    const userLimit = useSelector((state: GlobalState) => parseInt(getConfig(state).ExperimentalCloudUserLimit!, 10));
    const analytics = useSelector((state: GlobalState) => state.entities.admin.analytics);
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    const isCloud = useSelector((state: GlobalState) => getLicense(state).Cloud === 'true');
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const getCategory = makeGetCategory();
    const preferences = useSelector<GlobalState, PreferenceType[]>((state) => getCategory(state, Preferences.ADMIN_CLOUD_UPGRADE_PANEL));

    const contactSalesLink = useSelector((state: GlobalState) => getCloudContactUsLink(state, InquiryType.Sales));

    const onUpgradeMattermostCloud = () => {
        trackEvent('cloud_admin', 'click_upgrade_mattermost_cloud');

        dispatch(openModal({
            modalId: ModalIdentifiers.CLOUD_PURCHASE,
            dialogType: PurchaseModal,
        }));
    };

    useEffect(() => {
        getCloudSubscription()(dispatch, store.getState());
        getCloudProducts()(dispatch, store.getState());

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

        if ((userLimit - Number(analytics.TOTAL_USERS)) <= WARNING_THRESHOLD && (userLimit - Number(analytics.TOTAL_USERS) >= 0)) {
            return true;
        }

        return false;
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

    const upgradeMattermostCloud = () => (
        <div className='UpgradeMattermostCloud'>
            <div className='UpgradeMattermostCloud__image'>
                <img src={upgradeMattermostCloudImage}/>
            </div>
            <div className='UpgradeMattermostCloud__title'>
                <FormattedMessage
                    id='admin.billing.subscription.upgradeMattermostCloud.title'
                    defaultMessage='Need more users?'
                />
            </div>
            <div className='UpgradeMattermostCloud__description'>
                <FormattedMarkdownMessage
                    id='admin.billing.subscription.upgradeMattermostCloud.description'
                    defaultMessage='The free tier is **limited to 10 users.** Get access to more users, teams and other great features'
                />
            </div>
            <button
                onClick={onUpgradeMattermostCloud}
                className='UpgradeMattermostCloud__upgradeButton'
            >
                <FormattedMessage
                    id='admin.billing.subscription.upgradeMattermostCloud.upgradeButton'
                    defaultMessage='Upgrade Mattermost Cloud'
                />
            </button>
        </div>
    );

    const privateCloudCard = () => (
        <div className='PrivateCloudCard'>
            <div className='PrivateCloudCard__text'>
                <div className='PrivateCloudCard__text-title'>
                    <FormattedMessage
                        id='admin.billing.subscription.privateCloudCard.title'
                        defaultMessage='Looking for a high-trust private cloud?'
                    />
                </div>
                <div className='PrivateCloudCard__text-description'>
                    <FormattedMessage
                        id='admin.billing.subscription.privateCloudCard.description'
                        defaultMessage='If you need software with dedicated, single-tenant architecture, Mattermost Private Cloud (Beta) is the solution for high-trust collaboration.'
                    />
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

    if (!subscription) {
        return null;
    }

    return (
        <div className='wrapper--fixed BillingSubscriptions'>
            <FormattedAdminHeader
                id='admin.billing.subscription.title'
                defaultMessage='Subscriptions'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    {shouldShowInfoBanner() && (
                        <AlertBanner
                            mode='info'
                            title={formatMessage({
                                id: 'billing.subscription.info.headsup',
                                defaultMessage: 'Just a heads up',
                            })}
                            message={formatMessage({
                                id: 'billing.subscription.info.headsup.description',
                                defaultMessage:
                    'You’re nearing the user limit with the free tier of Mattermost Cloud. We’ll let you know if you hit that limit.',
                            })}
                            onDismiss={() => handleHide()}
                        />
                    )}
                    <div
                        className='BillingSubscriptions__topWrapper'
                        style={{marginTop: '20px'}}
                    >
                        <PlanDetails/>
                        {subscription?.is_paid_tier === 'true' ? <BillingSummary/> : upgradeMattermostCloud()}
                    </div>
                    {privateCloudCard()}
                </div>
            </div>
        </div>
    );
};

export default BillingSubscriptions;
