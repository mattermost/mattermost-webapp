// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Limits, Subscription, Product} from '@mattermost/types/cloud';
import {GlobalState} from '@mattermost/types/store';

import {getLicense} from './general';

export function getCloudLimits(state: GlobalState): Limits {
    return state.entities.cloud.limits.limits;
}

export function getCloudSubscription(state: GlobalState): Subscription | undefined {
    return state.entities.cloud.subscription;
}

export function getCloudProducts(state: GlobalState): Record<string, Product> | undefined {
    return state.entities.cloud.products;
}

export function getCloudLimitsLoaded(state: GlobalState): boolean {
    return state.entities.cloud.limits.limitsLoaded;
}

export function getCloudProduct(state: GlobalState): Product | undefined {
    const currentSubscription = getCloudSubscription(state);
    if (state.entities.cloud.products && currentSubscription) {
        return state.entities.cloud.products[currentSubscription?.product_id];
    }

    return undefined;
}

export function isCurrentLicenseCloud(state: GlobalState): boolean {
    const license = getLicense(state);
    return license?.Cloud === 'true';
}
