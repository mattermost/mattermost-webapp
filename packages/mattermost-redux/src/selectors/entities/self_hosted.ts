// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.


import {GlobalState} from '@mattermost/types/store';

export function getSelfHostedSubscription(state: GlobalState) {
    return state.entities.selfHosted.subscription;
};

export function getSelfHostedProducts(state: GlobalState) {
    return state.entities.selfHosted.products;
}

export function getSubscriptionProduct(state: GlobalState) {
    const subscription = getSelfHostedSubscription(state);
    if (!subscription) {
        return undefined;
    }
    const products = getSelfHostedProducts(state);
    if (!products) {
        return undefined;
    }

    return products[subscription.product_id];
}
