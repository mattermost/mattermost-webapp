// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from './api/types';
import {getAdminAccount} from './env';

function externalActivateUser(userId: string, active = true): ChainableT<any> {
    const baseUrl = Cypress.config('baseUrl');
    const admin = getAdminAccount();

    return cy.externalRequest({
        user: admin,
        method: 'put',
        baseUrl,
        path: `users/${userId}/active`,
        data: {active}
    });
}
Cypress.Commands.add('externalActivateUser', externalActivateUser);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Makes an external request as a sysadmin and activate/deactivate a user directly via API
             * @param {String} userId - The user ID
             * @param {Boolean} active - Whether to activate or deactivate - true/false
             *
             * @example
             *   cy.externalActivateUser('user-id', false);
             */
            externalActivateUser: typeof externalActivateUser;
        }
    }
}
