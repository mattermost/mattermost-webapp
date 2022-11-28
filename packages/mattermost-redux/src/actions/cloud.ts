// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CloudTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';

import {DispatchFunc, GetStateFunc, ActionFunc} from 'mattermost-redux/types/actions';
import {Address, CloudCustomerPatch} from '@mattermost/types/cloud';

import {getCloudErrors} from 'mattermost-redux/selectors/entities/cloud';
import {getCloudLimits} from 'actions/cloud';

import {bindClientFunc} from './helpers';

export function getCloudSubscription(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getSubscription,
        onSuccess: [CloudTypes.RECEIVED_CLOUD_SUBSCRIPTION],
        onFailure: CloudTypes.CLOUD_SUBSCRIPTION_FAILED,
        onRequest: CloudTypes.CLOUD_SUBSCRIPTION_REQUEST,
    });
}

export function getCloudProducts(includeLegacyProducts?: boolean): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getCloudProducts,
        onSuccess: [CloudTypes.RECEIVED_CLOUD_PRODUCTS],
        onFailure: CloudTypes.CLOUD_PRODUCTS_FAILED,
        onRequest: CloudTypes.CLOUD_PRODUCTS_REQUEST,
        params: [includeLegacyProducts],
    });
}

export function getCloudCustomer(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getCloudCustomer,
        onSuccess: [CloudTypes.RECEIVED_CLOUD_CUSTOMER],
        onFailure: CloudTypes.CLOUD_CUSTOMER_FAILED,
        onRequest: CloudTypes.CLOUD_CUSTOMER_REQUEST,
    });
}

export function getInvoices(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getInvoices,
        onSuccess: [CloudTypes.RECEIVED_CLOUD_INVOICES],
        onFailure: CloudTypes.CLOUD_INVOICES_FAILED,
        onRequest: CloudTypes.CLOUD_INVOICES_REQUEST,
    });
}

export function retryFailedCloudFetches() {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const errors = getCloudErrors(getState());
        if (Object.keys(errors).length === 0) {
            return {data: true};
        }

        if (errors.subscription) {
            dispatch(getCloudSubscription());
        }

        if (errors.products) {
            dispatch(getCloudProducts());
        }

        if (errors.customer) {
            dispatch(getCloudCustomer());
        }

        if (errors.invoices) {
            dispatch(getInvoices());
        }

        if (errors.limits) {
            getCloudLimits()(dispatch, getState);
        }

        return {data: true};
    };
}

export function updateCloudCustomer(customerPatch: CloudCustomerPatch): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.updateCloudCustomer,
        onSuccess: [CloudTypes.RECEIVED_CLOUD_CUSTOMER],
        params: [customerPatch],
    });
}

export function updateCloudCustomerAddress(address: Address): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.updateCloudCustomerAddress,
        onSuccess: [CloudTypes.RECEIVED_CLOUD_CUSTOMER],
        params: [address],
    });
}
