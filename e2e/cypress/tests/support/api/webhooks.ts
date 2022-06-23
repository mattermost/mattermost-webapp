// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// *****************************************************************************
// Webhooks
// https://api.mattermost.com/#tag/webhooks
// *****************************************************************************
import {ChainableT} from './types';

function apiGetIncomingWebhook(hookId: string): ChainableT<{webhook: any, status: number}>{
    const options = {
        url: `api/v4/hooks/incoming/${hookId}`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'GET',
        failOnStatusCode: false,
    };

    return cy.request(options).then((response) => {
        const {body, status} = response;
        return cy.wrap({webhook: body, status});
    });
}
Cypress.Commands.add('apiGetIncomingWebhook', apiGetIncomingWebhook);

function apiGetOutgoingWebhook(hookId: string): ChainableT<{webhook: any, status: number}> {
    const options = {
        url: `api/v4/hooks/outgoing/${hookId}`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'GET',
        failOnStatusCode: false,
    };

    return cy.request(options).then((response) => {
        const {body, status} = response;
        return cy.wrap({webhook: body, status});
    });
}
Cypress.Commands.add('apiGetOutgoingWebhook', apiGetOutgoingWebhook);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Get an incoming webhook given the hook id.
             * @param {string} hookId - Incoming Webhook GUID
             * @returns {IncomingWebhook} `out.webhook` as `IncomingWebhook`
             * @returns {string} `out.status`
             * @example
             *   cy.apiGetIncomingWebhook('hook-id')
             */
            apiGetIncomingWebhook: typeof apiGetIncomingWebhook;

            /**
             * Get an outgoing webhook given the hook id.
             * @param {string} hookId - Outgoing Webhook GUID
             * @returns {OutgoingWebhook} `out.webhook` as `OutgoingWebhook`
             * @returns {string} `out.status`
             * @example
             *   cy.apiGetOutgoingWebhook('hook-id')
             */
            apiGetOutgoingWebhook: typeof apiGetOutgoingWebhook;
        }
    }
}
