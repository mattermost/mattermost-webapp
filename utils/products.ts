// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ProductComponent} from '../types/store/plugins';
import {getBasePath} from './url';
import {RouteComponentProps} from 'react-router-dom';

export const getCurrentProductId = (products: ProductComponent[], location: RouteComponentProps["location"]): string | null => {
    if (!products) {
        return null;
    }

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (location.pathname.startsWith(getBasePath() + product.baseURL)) {
            return product.id;
        }
    }

    return null;
};
