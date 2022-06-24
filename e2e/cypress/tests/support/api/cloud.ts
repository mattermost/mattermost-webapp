// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Subscription, Product} from '@mattermost/types/cloud';

import {ChainableT} from './types';

function apiGetCloudProducts(): ChainableT<{products: Product[]}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/cloud/products',
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({products: response.body});
    });
}
Cypress.Commands.add('apiGetCloudProducts', apiGetCloudProducts);

function apiGetCloudSubscription(): ChainableT<{subscription: Subscription}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/cloud/subscription',
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({subscription: response.body});
    });
}
Cypress.Commands.add('apiGetCloudSubscription', apiGetCloudSubscription);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Get products.
             * See https://api.mattermost.com/#operation/GetCloudProducts
             * @returns {Product[]} out.Products: `Product[]` object
             *
             * @example
             *   cy.apiGetCloudProducts();
             */
            apiGetCloudProducts: typeof apiGetCloudProducts;

            /**
             * Get subscriptions.
             * See https://api.mattermost.com/#operation/GetSubscription
             * @returns {Subscription} out.subscription: `Subscription` object
             *
             * @example
             *   cy.apiGetCloudSubscription();
             */
            apiGetCloudSubscription(): Chainable<{subscription: Subscription}>;
        }
    }
}
