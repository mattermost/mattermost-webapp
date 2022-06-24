// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ResponseT} from './types';

// *****************************************************************************
// Brand
// https://api.mattermost.com/#tag/brand
// *****************************************************************************

function apiDeleteBrandImage(): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/brand/image',
        method: 'DELETE',
        failOnStatusCode: false,
    }).then((response) => {
        // both deleted and not existing responses are valid
        expect(response.status).to.be.oneOf([200, 404]);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiDeleteBrandImage', apiDeleteBrandImage);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Delete the custom brand image.
             * See https://api.mattermost.com/#tag/brand/paths/~1brand~1image/delete
             * @returns {Response} response: Cypress-chainable response which should have either a successful HTTP status of 200 OK
             * or a 404 Not Found in case that the image didn't exists to continue or pass.
             *
             * @example
             *   cy.apiDeleteBrandImage();
             */
            apiDeleteBrandImage: typeof apiDeleteBrandImage;
        }
    }
}
