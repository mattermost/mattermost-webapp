// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    Limits,
    Subscription,
    Product,
    CloudCustomer,
    CloudState,
    SelfHostedSignupProgress,
} from '@mattermost/types/cloud';
import {GlobalState} from '@mattermost/types/store';
import {ValueOf} from '@mattermost/types/utilities';
import { subscription } from 'mattermost-redux/reducers/entities/cloud';
import { CloudProducts, SelfHostedProducts } from 'utils/constants';

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

export function getCloudErrors(state: GlobalState): CloudState['errors'] {
    return state.entities.cloud.errors;
}

export function getCloudInvoices(state: GlobalState): CloudState['invoices'] {
    return state.entities.cloud.invoices;
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

export function getSubscriptionProductName(state: GlobalState): string {
    return getSubscriptionProduct(state)?.name || '';
}

export function checkHadPriorTrial(state: GlobalState): boolean {
    const subscription = getCloudSubscription(state);
    return Boolean(subscription?.is_free_trial === 'false' && subscription?.trial_end_at > 0);
}

export function isCurrentLicenseCloud(state: GlobalState): boolean {
    const license = getLicense(state);
    return license?.Cloud === 'true';
}

export function getSelfHostedSignupProgress(state: GlobalState): ValueOf<typeof SelfHostedSignupProgress> {
    return state.entities.cloud.selfHostedSignup.progress;
}

export function getCWSHealthCheckResult(state: GlobalState): boolean {
    return state.entities.cloud.healthCheck.cwsAvailable;
}

export function isDelinquent(state: GlobalState): boolean {
    return Boolean(state.entities.cloud.subscription?.delinquent_since)
}

export function isFreeTrial(state: GlobalState): boolean {
    return state.entities.cloud.subscription?.is_free_trial === 'true';
}

export function getCurrentProduct(state: GlobalState): Product | null {
    const productId = state.entities.cloud.subscription?.product_id;
    const products = getCloudProducts(state)

    if (!products) {
        return null
    }

    const keys = Object.keys(products);
    if (!keys.length) {
        return null;
    }
    if (!productId) {
        return products[keys[0]];
    }
    let currentProduct = products[keys[0]];
    if (keys.length > 1) {
        // here find the product by the provided id or name, otherwise return the one with Professional in the name
        keys.forEach((key) => {
            if (productId && products[key].id === productId) {
                currentProduct = products[key];
            }
        });
    }

    return currentProduct;
}

export function getSelectedProduct(state: GlobalState) {
    const products = getCloudProducts(state);
    const license = getLicense(state);
    const isCloud = license.Cloud === 'true';
    let currentProduct = getCurrentProduct(state)

    let nextSku = SelfHostedProducts.PROFESSIONAL;
    if (isCloud) {
        nextSku = CloudProducts.PROFESSIONAL;
        if (currentProduct?.sku === CloudProducts.PROFESSIONAL) {
            nextSku = CloudProducts.ENTERPRISE;
        }
    } else {
        if (currentProduct?.sku === SelfHostedProducts.PROFESSIONAL) {
            nextSku = SelfHostedProducts.ENTERPRISE;
        }
    }

    if (!products) {
        return null;
    }
    const keys = Object.keys(products);
    if (!keys.length) {
        return null;
    }
    if (!nextSku) {
        return products[keys[0]];
    }

    if (keys.length > 1) {
        // here find the product by the provided id or name, otherwise return the one with Professional in the name
        keys.forEach((key) => {
            if (nextSku && products[key].sku === nextSku) {
                currentProduct = products[key];
            }
        });
    }

    return currentProduct;
}