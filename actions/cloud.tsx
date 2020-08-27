
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';

export async function getProductPrice() {
    let cloudProducts;
    try {
        cloudProducts = await Client4.getCloudProducts();
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error fetching cloud products: ${error}`);
    }

    let productPrice = 0;
    if (cloudProducts?.length > 0) {
        productPrice = cloudProducts[0].dollars_per_seat;
    }

    return productPrice;
}