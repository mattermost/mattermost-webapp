// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {RouteComponentProps} from 'react-router-dom';

import {GlobalState} from '../types/store';
import type {ProductComponent} from '../types/store/plugins';

import {getCurrentProductId} from '../utils/products';

export function getCurrentProduct(state: GlobalState, location: RouteComponentProps['location']): ProductComponent | undefined {
    const productID = getCurrentProductId(state.plugins.components.Product, location);
    return state.plugins.components.Product.find((product) => product.id === productID);
}
