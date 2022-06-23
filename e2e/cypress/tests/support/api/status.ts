// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// *****************************************************************************
// Status
// https://api.mattermost.com/#tag/status
// *****************************************************************************
import {UserStatus, UserCustomSatus} from '@mattermost/types/users'

function apiUpdateUserStatus(status = 'online'): Cypress.Chainable<{status: UserStatus}> {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const data = {user_id: cookie.value, status};

        return cy.request({
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            url: '/api/v4/users/me/status',
            method: 'PUT',
            body: data,
        }).then((response) => {
            expect(response.status).to.equal(200);
            return cy.wrap({status: response.body});
        });
    });
}
Cypress.Commands.add('apiUpdateUserStatus', apiUpdateUserStatus);

function apiGetUserStatus(userId: string): Cypress.Chainable<{status: UserStatus}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/users/${userId}/status`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({status: response.body});
    });
}
Cypress.Commands.add('apiGetUserStatus', apiGetUserStatus);

function apiUpdateUserCustomStatus(customStatus: UserCustomSatus): Cypress.Chainable<Cypress.Response<void>> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/me/status/custom',
        method: 'PUT',
        body: JSON.stringify(customStatus),
    }).then((response) => {
        expect(response.status).to.equal(200);
    });
}
Cypress.Commands.add('apiUpdateUserCustomStatus', apiUpdateUserCustomStatus);

function apiClearUserCustomStatus(): Cypress.Chainable<Cypress.Response<void>> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/me/status/custom',
        method: 'DELETE',
    }).then((response) => {
        expect(response.status).to.equal(200);
    });
}
Cypress.Commands.add('apiClearUserCustomStatus', apiClearUserCustomStatus);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Update status of a current user.
             * See https://api.mattermost.com/#tag/status/paths/~1users~1{user_id}~1status/put
             * @param {String} status - "online" (default), "offline", "away" or "dnd"
             * @returns {UserStatus} `out.status` as `UserStatus`
             *
             * @example
             *   cy.apiUpdateUserStatus('offline').then(({status}) => {
             *       // do something with status
             *   });
             */
            apiUpdateUserStatus: typeof apiUpdateUserStatus;

            /**
             * Get status of a current user.
             * See https://api.mattermost.com/#tag/status/paths/~1users~1{user_id}~1status/get
             * @param {String} userId - ID of a given user
             * @returns {UserStatus} `out.status` as `UserStatus`
             *
             * @example
             *   cy.apiGetUserStatus('userId').then(({status}) => {
             *       // examine the status information of the user
             *   });
             */
            apiGetUserStatus: typeof apiGetUserStatus;

            /**
             * Update custom status of current user.
             * See https://api.mattermost.com/#tag/custom_status/paths/~1users~1{user_id}~1status/custom/put
             * @param {UserCustomStatus} customStatus - custom status to be updated
             *
             * @example
             *   cy.apiUpdateUserCustomStatus({emoji: 'calendar', text: 'In a meeting'});
             */
            apiUpdateUserCustomStatus: typeof apiUpdateUserCustomStatus;

            /**
             * Clear custom status of the current user.
             * See https://api.mattermost.com/#tag/custom_status/paths/~1users~1{user_id}~1status/custom/delete
             * @param {UserCustomStatus} customStatus - custom status to be updated
             *
             * @example
             *   cy.apiClearUserCustomStatus();
             */
            apiClearUserCustomStatus: typeof apiClearUserCustomStatus;
        }
    }
}
