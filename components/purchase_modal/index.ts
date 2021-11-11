// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {Stripe} from '@stripe/stripe-js';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getClientConfig} from 'mattermost-redux/actions/general';
import {getCloudProducts, getCloudSubscription} from 'mattermost-redux/actions/cloud';
import {Action} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';
import {BillingDetails} from 'types/cloud/sku';

import {isModalOpen} from 'selectors/views/modals';
import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';

import {ModalIdentifiers} from 'utils/constants';

import {closeModal} from 'actions/views/modals';
import {completeStripeAddPaymentMethod, subscribeCloudSubscription} from 'actions/cloud';

import PurchaseModal from './purchase_modal';

function mapStateToProps(state: GlobalState) {
    const subscription = state.entities.cloud.subscription;

    return {
        show: isModalOpen(state, ModalIdentifiers.CLOUD_PURCHASE),
        products: state.entities.cloud!.products,
        isDevMode: getConfig(state).EnableDeveloper === 'true',
        contactSupportLink: getCloudContactUsLink(state, InquiryType.Technical),
        isFreeTrial: subscription?.is_free_trial === 'true',
        isFreeTier: subscription?.is_paid_tier === 'false',
        contactSalesLink: getCloudContactUsLink(state, InquiryType.Sales),
        productId: subscription?.product_id,
        customer: state.entities.cloud.customer,
    };
}
type Actions = {
    closeModal: () => void;
    getCloudProducts: () => void;
    completeStripeAddPaymentMethod: (stripe: Stripe, billingDetails: BillingDetails, isDevMode: boolean) => Promise<boolean | null>;
    subscribeCloudSubscription: (productId: string) => Promise<boolean | null>;
    getClientConfig: () => void;
    getCloudSubscription: () => void;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>(
            {
                closeModal: () => closeModal(ModalIdentifiers.CLOUD_PURCHASE),
                getCloudProducts,
                completeStripeAddPaymentMethod,
                subscribeCloudSubscription,
                getClientConfig,
                getCloudSubscription,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseModal);
