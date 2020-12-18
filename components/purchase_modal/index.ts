// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {Stripe} from '@stripe/stripe-js';

import {getCloudProducts} from 'mattermost-redux/actions/cloud';

import {
    getClientConfig,
} from 'mattermost-redux/actions/general';

import {BillingDetails} from 'types/cloud/sku';

import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import {closeModal} from 'actions/views/modals';
import {completeStripeAddPaymentMethod} from 'actions/cloud';

import {GlobalState} from 'types/store';

import PurchaseModal from './purchase_modal';

function mapStateToProps(state: GlobalState) {
    return {
        show: isModalOpen(state, ModalIdentifiers.CLOUD_PURCHASE),
        products: state.entities.cloud!.products,
        isDevMode: getConfig(state).EnableDeveloper === 'true',
    };
}
type Actions = {
    closeModal: () => void;
    getCloudProducts: () => void;
    completeStripeAddPaymentMethod: (stripe: Stripe, billingDetails: BillingDetails, isDevMode: boolean) => Promise<boolean | null>;
    getClientConfig: () => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>(
            {
                closeModal: () => closeModal(ModalIdentifiers.CLOUD_PURCHASE),
                getCloudProducts,
                completeStripeAddPaymentMethod,
                getClientConfig,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseModal);
