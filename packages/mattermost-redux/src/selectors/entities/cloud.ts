// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Limits, Subscription, Product, CloudCustomer} from '@mattermost/types/cloud';
import {GlobalState} from '@mattermost/types/store';
import {LegacyFreeProductIds} from 'utils/constants';

import {getLicense} from './general';

export function getCloudLimits(state: GlobalState): Limits {
    return state.entities.cloud.limits.limits;
}

export function getCloudSubscription(state: GlobalState): Subscription | undefined {
    return state.entities.cloud.subscription;
}

export function getCloudCustomer(state: GlobalState): CloudCustomer | undefined {
    return state.entities.cloud.customer;
}

export function getCloudProducts(state: GlobalState): Record<string, Product> | undefined {
    return state.entities.cloud.products;
}

export function getCloudLimitsLoaded(state: GlobalState): boolean {
    return state.entities.cloud.limits.limitsLoaded;
}

export function getSubscriptionProduct(state: GlobalState): Product | undefined {
    const subscription = getCloudSubscription(state);
    if (!subscription) {
        return undefined;
    }
    const products = getCloudProducts(state);
    if (!products) {
        return undefined;
    }

    return products[subscription.product_id];
}

export function checkSubscriptionIsLegacyFree(state: GlobalState): boolean {
    return Boolean(LegacyFreeProductIds[getCloudSubscription(state)?.product_id || '']);
}

export function isCurrentLicenseCloud(state: GlobalState): boolean {
    const license = getLicense(state);
    return license?.Cloud === 'true';
}
