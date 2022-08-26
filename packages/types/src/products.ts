// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * - `null` - explicitly Channels
 * - `string` - uuid - any other product
 */
export type ProductIdentifier = null | string;

/** @see {@link ProductIdentifier} */
export type ProductScope = ProductIdentifier | ProductIdentifier[];

export const inScope = (scope: ProductScope, productId: ProductIdentifier, pluginId?: string) => {
    if (scope === '*' || scope?.includes('*')) {
        return true;
    }
    if (Array.isArray(scope)) {
        return scope.includes(productId) || (pluginId !== undefined && scope.includes(pluginId));
    }
    return scope === productId || (pluginId !== undefined && scope === pluginId);
};

export const isChannels = (productId: ProductIdentifier) => productId === null;
