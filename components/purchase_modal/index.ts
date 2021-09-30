// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {Stripe} from '@stripe/stripe-js';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getClientConfig} from 'mattermost-redux/actions/general';
import {getCloudProducts, getCloudSubscription} from 'mattermost-redux/actions/cloud';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {GlobalState} from 'types/store';
import {BillingDetails} from 'types/cloud/sku';

import {isModalOpen} from 'selectors/views/modals';
import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';

import {Preferences, ModalIdentifiers} from 'utils/constants';

import {closeModal} from 'actions/views/modals';
import {completeStripeAddPaymentMethod, subscribeCloudSubscription} from 'actions/cloud';

import PurchaseModal from './purchase_modal';

function mapStateToProps(state: GlobalState) {
    const subscription = state.entities.cloud.subscription;
    const getCategory = makeGetCategory();

    return {
        show: isModalOpen(state, ModalIdentifiers.CLOUD_PURCHASE),
        products: state.entities.cloud!.products,
        isDevMode: getConfig(state).EnableDeveloper === 'true',
        contactSupportLink: getCloudContactUsLink(state, InquiryType.Technical),
        isFreeTrial: subscription?.is_free_trial === 'true',
        contactSalesLink: getCloudContactUsLink(state, InquiryType.Sales),
        productId: subscription?.product_id,
        customer: state.entities.cloud.customer,
        currentUser: getCurrentUser(state),
        preferences: getCategory(state, Preferences.UNIQUE),
    };
}
type Actions = {
    closeModal: () => void;
    getCloudProducts: () => void;
    completeStripeAddPaymentMethod: (stripe: Stripe, billingDetails: BillingDetails, isDevMode: boolean) => Promise<boolean | null>;
    subscribeCloudSubscription: (productId: string) => Promise<boolean | null>;
    getClientConfig: () => void;
    getCloudSubscription: () => void;
    savePreferences: (userId: string, preferences: PreferenceType[]) => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>(
            {
                closeModal: () => closeModal(ModalIdentifiers.CLOUD_PURCHASE),
                getCloudProducts,
                completeStripeAddPaymentMethod,
                subscribeCloudSubscription,
                getClientConfig,
                getCloudSubscription,
                savePreferences,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseModal);
