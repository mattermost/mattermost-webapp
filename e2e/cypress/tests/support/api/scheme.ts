// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// *****************************************************************************
// Schemes
// https://api.mattermost.com/#tag/schemes
// *****************************************************************************
import {Scheme} from '@mattermost/types/schemes';

import {ChainableT, ResponseT} from './types';

function apiGetSchemes(scope: string): ChainableT<{schemes: Scheme[]}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/schemes?scope=${scope}`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({schemes: response.body});
    });
}
Cypress.Commands.add('apiGetSchemes', apiGetSchemes);

function apiDeleteScheme(schemeId: string): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/schemes/' + schemeId,
        method: 'DELETE',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiDeleteScheme', apiDeleteScheme);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Get the schemes.
             * See https://api.mattermost.com/#tag/schemes/paths/~1schemes/get
             * @param {string} scope - Limit the results returned to the provided scope, either team or channel.
             * @returns {Scheme[]} `out.schemes` as `Scheme[]`
             *
             * @example
             *   cy.apiGetSchemes('team').then(({schemes}) => {
             *       // do something with schemes
             *   });
             */
            apiGetSchemes(scope: string): Chainable<Scheme[]>;

            /**
             * Delete a scheme.
             * See https://api.mattermost.com/#tag/schemes/paths/~1schemes~1{scheme_id}/delete
             * @param {string} schemeId - ID of the scheme to delete
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiDeleteScheme('scheme_id');
             */
            apiDeleteScheme: typeof apiDeleteScheme;
        }
    }
}
