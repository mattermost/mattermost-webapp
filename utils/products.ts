// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useLocation, matchPath} from 'react-router-dom';

import {useSelector} from 'react-redux';

import {ProductIdentifier, ProductScope} from '@mattermost/types/products';

import {ProductComponent} from 'types/store/plugins';
import {selectProducts, selectCurrentProductId, selectCurrentProduct} from 'selectors/products';
import {GlobalState} from 'types/store';

export const getCurrentProductId = (
    products: ProductComponent[],
    pathname: string,
): ProductIdentifier => {
    return getCurrentProduct(products, pathname)?.id ?? null;
};

export const getCurrentProduct = (
    products: ProductComponent[],
    pathname: string,
): ProductComponent | null => {
    return products?.find(({baseURL}) => matchPath(pathname, {path: baseURL, exact: false, strict: false})) ?? null;
};

export const useProducts = (): ProductComponent[] | undefined => {
    return useSelector(selectProducts);
};

export const useCurrentProductId = () => {
    const {pathname} = useLocation();
    return useSelector((state: GlobalState) => selectCurrentProductId(state, pathname));
};

export const useCurrentProduct = () => {
    const {pathname} = useLocation();
    return useSelector((state: GlobalState) => selectCurrentProduct(state, pathname));
};

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

