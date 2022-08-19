// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {Stripe} from '@stripe/stripe-js';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getClientConfig} from 'mattermost-redux/actions/general';
import {getCloudProducts, getCloudSubscription} from 'mattermost-redux/actions/cloud';
import {Action} from 'mattermost-redux/types/actions';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {makeAsyncComponent} from 'components/async_load';

import {GlobalState} from 'types/store';
import {BillingDetails} from 'types/cloud/sku';

import {isModalOpen} from 'selectors/views/modals';
import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';

import {ModalIdentifiers} from 'utils/constants';

import {closeModal, openModal} from 'actions/views/modals';
import {completeStripeAddPaymentMethod, subscribeCloudSubscription} from 'actions/cloud';
import {ModalData} from 'types/actions';
import {Address} from '@mattermost/types/cloud';

const PurchaseModal = makeAsyncComponent('PurchaseModal', React.lazy(() => import('./purchase_modal')));

function mapStateToProps(state: GlobalState) {
    const subscription = state.entities.cloud.subscription;

    return {
        show: isModalOpen(state, ModalIdentifiers.CLOUD_PURCHASE),
        products: state.entities.cloud!.products,
        isDevMode: getConfig(state).EnableDeveloper === 'true',
        contactSupportLink: getCloudContactUsLink(state)(InquiryType.Technical),
        isFreeTrial: subscription?.is_free_trial === 'true',
        isComplianceBlocked: subscription?.compliance_blocked === 'true',
        contactSalesLink: getCloudContactUsLink(state)(InquiryType.Sales),
        productId: subscription?.product_id,
        customer: state.entities.cloud.customer,
        currentTeam: getCurrentTeam(state),
        theme: getTheme(state),
    };
}
type Actions = {
    closeModal: () => void;
    openModal: <P>(modalData: ModalData<P>) => void;
    getCloudProducts: () => void;
    completeStripeAddPaymentMethod: (stripe: Stripe, billingDetails: BillingDetails, isDevMode: boolean) => Promise<boolean | null>;
    subscribeCloudSubscription: (productId: string, shippingAddress: Address) => Promise<boolean | null>;
    getClientConfig: () => void;
    getCloudSubscription: () => void;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>(
            {
                closeModal: () => closeModal(ModalIdentifiers.CLOUD_PURCHASE),
                openModal,
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
