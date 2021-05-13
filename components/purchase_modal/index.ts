// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {Stripe} from '@stripe/stripe-js';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {getCloudProducts, getCloudSubscription} from 'mattermost-redux/actions/cloud';
import {getClientConfig} from 'mattermost-redux/actions/general';

import {GlobalState} from 'types/store';
import {BillingDetails} from 'types/cloud/sku';

import {isModalOpen} from 'selectors/views/modals';
import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';

import {ModalIdentifiers} from 'utils/constants';

import {closeModal} from 'actions/views/modals';
import {completeStripeAddPaymentMethod, updateCloudSelectedProduct} from 'actions/cloud';

import PurchaseModal from './purchase_modal';

function mapStateToProps(state: GlobalState) {
    const subscription = state.entities.cloud.subscription;
    const products = [
        {
            add_ons: null,
            description: '',
            id: 'prod_Hm2oYaBiRSISL1',
            name: 'Mattermost Cloud Starter',
            price_per_seat: 8,
        },
        {
            add_ons: null,
            description: '',
            id: 'prod_Hm2oYaBiRSISL2',
            name: 'Mattermost Cloud Professional',
            price_per_seat: 10,
        },
        {
            add_ons: null,
            description: '',
            id: 'prod_Hm2oYaBiRSISL3',
            name: 'Mattermost Cloud Enterprise',
            price_per_seat: 12,
        },
    ];
    return {
        show: isModalOpen(state, ModalIdentifiers.CLOUD_PURCHASE),
        products, // state.entities.cloud!.products,
        isDevMode: getConfig(state).EnableDeveloper === 'true',
        contactSupportLink: getCloudContactUsLink(state, InquiryType.Technical),
        isFreeTrial: true, //subscription?.is_free_trial === 'true',
        contactSalesLink: getCloudContactUsLink(state, InquiryType.Sales),
    };
}
type Actions = {
    closeModal: () => void;
    getCloudProducts: () => void;
    completeStripeAddPaymentMethod: (stripe: Stripe, billingDetails: BillingDetails, isDevMode: boolean) => Promise<boolean | null>;
    updateCloudSelectedProduct: (selectedProductId: string, subscriptionId: string, installationId: string) => Promise<boolean | null>;
    getClientConfig: () => void;
    getCloudSubscription: () => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>(
            {
                closeModal: () => closeModal(ModalIdentifiers.CLOUD_PURCHASE),
                getCloudProducts,
                completeStripeAddPaymentMethod,
                updateCloudSelectedProduct,
                getClientConfig,
                getCloudSubscription,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseModal);
