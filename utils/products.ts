// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useLocation, matchPath} from 'react-router';

import {useSelector} from 'react-redux';

import {ProductComponent} from 'types/store/plugins';
import {selectProducts, selectCurrentProductId, selectCurrentProduct} from 'selectors/products';
import {GlobalState} from 'types/store';
import {ProductIdentifier} from '@mattermost/types/products';

export const getCurrentProductId = (
    products: ProductComponent[],
    pathname: string,
): ProductIdentifier => {
    return products?.find(({baseURL}) => matchPath(pathname, {path: baseURL, exact: false, strict: false}))?.id ?? null;
};

export const getCurrentProduct = (
    products: ProductComponent[],
    pathname: string,
): ProductComponent | null => {
    const productID = getCurrentProductId(products, pathname);
    return products.find((product) => product.id === productID) ?? null;
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
