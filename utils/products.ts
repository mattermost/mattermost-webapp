// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ProductComponent} from '../types/store/plugins';
import {Product} from '@mattermost/types/cloud';

export const getCurrentProductId = (products: ProductComponent[], pathname: string): string | null => {
    if (!products) {
        return null;
    }

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (pathname.startsWith(product.baseURL)) {
            return product.id;
        }
    }

    return null;
};

// find a product based on its SKU an RecurringInterval
export const findProductBySkuAndInterval = (products: Record<string, Product>, sku: string, interval: string) => {
    return Object.values(products).find(((product) => {
        return product.sku === sku && product.recurring_interval === interval;
    }));
};