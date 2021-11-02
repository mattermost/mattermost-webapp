// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {RouteComponentProps} from 'react-router-dom';

import {GlobalState} from '../types/store';
import type {ProductComponent} from '../types/store/plugins';

import {getCurrentProductId} from '../utils/products';

export function getCurrentProduct(products: ProductComponent[], pathname: string): ProductComponent | undefined {
    const productID = getCurrentProductId(products, pathname);
    return products.find((product) => product.id === productID);
}
