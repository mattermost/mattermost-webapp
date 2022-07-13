// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from '@mattermost/types/store';
import {SelfHostedProduct, SelfHostedSubscription} from '@mattermost/types/hosted';

export function selectSelfHostedSubscription(state: GlobalState): SelfHostedSubscription | undefined {
    return state.entities.hosted.subscription;
}

export function selectSelfHostedProducts(state: GlobalState): Record<string, SelfHostedProduct> | undefined {
    return state.entities.hosted.products;
}

export function selectSelfHostedSubscriptionProduct(state: GlobalState): SelfHostedProduct | undefined {
    const subscription = selectSelfHostedSubscription(state);
    if (!subscription) {
        return undefined;
    }
    const products = selectSelfHostedProducts(state);
    if (!products) {
        return undefined;
    }

    return products[subscription.product_id];
}
