// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {HostedTypes} from 'mattermost-redux/action_types';

import {GenericAction} from 'mattermost-redux/types/actions';
import {SelfHostedCustomer, SelfHostedProduct, SelfHostedSubscription} from '@mattermost/types/hosted';

function products(state: Record<string, SelfHostedProduct> | null = null, action: GenericAction) {
    switch (action.type) {
    case HostedTypes.RECEIVED_SELF_HOSTED_PRODUCTS: {
        const productList: SelfHostedProduct[] = action.data;
        const productDict = productList.reduce((map, obj) => {
            map[obj.id] = obj;
            return map;
        }, {} as Record<string, SelfHostedProduct>);
        return {
            ...state,
            ...productDict,
        };
    }
    default:
        return state;
    }
}

export function subscription(state: SelfHostedSubscription | null = null, action: GenericAction) {
    switch (action.type) {
    case HostedTypes.RECEIVED_SELF_HOSTED_SUBSCRIPTION: {
        return action.data;
    }
    default:
        return state;
    }
}

function customer(state: SelfHostedCustomer | null = null, action: GenericAction) {
    switch (action.type) {
    case HostedTypes.RECEIVED_SELF_HOSTED_CUSTOMER: {
        return action.data;
    }
    default:
        return state;
    }
}

export default combineReducers({
    customer,
    subscription,
    products,
});
