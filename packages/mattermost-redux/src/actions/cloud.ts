// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {CloudTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {Address, CloudCustomerPatch} from 'mattermost-redux/types/cloud';

import {bindClientFunc} from './helpers';

export function getCloudSubscription(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getSubscription,
        onSuccess: [CloudTypes.RECEIVED_CLOUD_SUBSCRIPTION],
    });
}

export function getCloudProducts(includeLegacyProducts?: boolean): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getCloudProducts,
        onSuccess: [CloudTypes.RECEIVED_CLOUD_PRODUCTS],
        params: [includeLegacyProducts],
    });
}

export function getSubscriptionStats(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getSubscriptionStats,
        onSuccess: CloudTypes.RECEIVED_CLOUD_SUBSCRIPTION_STATS,
    });
}

export function getCloudCustomer(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getCloudCustomer,
        onSuccess: [CloudTypes.RECEIVED_CLOUD_CUSTOMER],
    });
}

export function getInvoices(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getInvoices,
        onSuccess: [CloudTypes.RECEIVED_CLOUD_INVOICES],
    });
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
