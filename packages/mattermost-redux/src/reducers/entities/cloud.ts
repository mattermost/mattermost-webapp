// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {CloudTypes} from 'mattermost-redux/action_types';

import {GenericAction} from 'mattermost-redux/types/actions';
import {Product, Subscription, CloudCustomer, Invoice, SubscriptionStats} from 'mattermost-redux/types/cloud';
import {Dictionary} from 'mattermost-redux/types/utilities';

function subscription(state: Subscription | null = null, action: GenericAction) {
    switch (action.type) {
    case CloudTypes.RECEIVED_CLOUD_SUBSCRIPTION: {
        return action.data;
    }
    default:
        return state;
    }
}

function customer(state: CloudCustomer | null = null, action: GenericAction) {
    switch (action.type) {
    case CloudTypes.RECEIVED_CLOUD_CUSTOMER: {
        return action.data;
    }
    default:
        return state;
    }
}

function products(state: Dictionary<Product> | null = null, action: GenericAction) {
    switch (action.type) {
    case CloudTypes.RECEIVED_CLOUD_PRODUCTS: {
        const productList: Product[] = action.data;
        const productDict = productList.reduce((map, obj) => {
            map[obj.id] = obj;
            return map;
        }, {} as Dictionary<Product>);
        return {
            ...state,
            ...productDict,
        };
    }
    default:
        return state;
    }
}

function invoices(state: Dictionary<Invoice> | null = null, action: GenericAction) {
    switch (action.type) {
    case CloudTypes.RECEIVED_CLOUD_INVOICES: {
        const invoiceList: Invoice[] = action.data;
        const invoiceDict = invoiceList.reduce((map, obj) => {
            map[obj.id] = obj;
            return map;
        }, {} as Dictionary<Invoice>);
        return {
            ...state,
            ...invoiceDict,
        };
    }
    default:
        return state;
    }
}

function subscriptionStats(state: SubscriptionStats | null = null, action: GenericAction) {
    switch (action.type) {
    case CloudTypes.RECEIVED_CLOUD_SUBSCRIPTION_STATS: {
        const data = action.data;
        return {
            ...state,
            ...data,
        };
    }
    default:
        return state;
    }
}

export default combineReducers({

    // represents the current cloud customer
    customer,

    // represents the current cloud subscription
    subscription,

    // represents the cloud products offered
    products,

    // represents the invoices tied to the current subscription
    invoices,

    subscriptionStats,
});
