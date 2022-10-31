// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ProductIdentifier} from '@mattermost/types/products';

import {GlobalState} from 'types/store';
import type {ProductComponent} from '../types/store/plugins';

import {getCurrentProduct} from 'utils/products';

export function selectCurrentProduct(state: GlobalState, pathname: string): ProductComponent | null {
    return getCurrentProduct(selectProducts(state), pathname);
}

export function selectCurrentProductId(state: GlobalState, pathname: string): ProductIdentifier {
    return selectCurrentProduct(state, pathname)?.id ?? null;
}

export const selectProducts = (state: GlobalState) => state.plugins.components.Product;
