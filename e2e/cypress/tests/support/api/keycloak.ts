// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// *****************************************************************************
// Keycloak Admin REST API
// https://www.keycloak.org/documentation
// *****************************************************************************
import {ChainableT, ResponseT} from './types';

import realmJson from './keycloak_realm.json';

const {
    keycloakBaseUrl,
    keycloakAppName,
    keycloakUsername,
    keycloakPassword,
} = Cypress.env();

function apiKeycloakGetAccessToken(): ChainableT<string> {
    // @ts-ignore
    return cy.task('keycloakRequest', {
        baseUrl: `${keycloakBaseUrl}/auth/realms/master/protocol/openid-connect/token`,
        method: 'POST',
        headers: {'Content-type': 'application/x-www-form-urlencoded'},
        data: `grant_type=password&username=${keycloakUsername}&password=${keycloakPassword}&client_id=admin-cli`,
    }).then((response: Cypress.Response<{data: {access_token: string}}>) => {
        expect(response.status).to.equal(200);
        const token = response.body.data.access_token;
        return cy.wrap(token);
    });
}
Cypress.Commands.add('apiKeycloakGetAccessToken', apiKeycloakGetAccessToken);

function getRealmJson() {
    const baseUrl = Cypress.config('baseUrl');
    const {ldapServer, ldapPort} = Cypress.env();

    const realm = JSON.stringify(realmJson).
        replace(/localhost:389/g, `${ldapServer}:${ldapPort}`).
        replace(/http:\/\/localhost:8065/g, baseUrl);
    return JSON.parse(realm);
}

function apiKeycloakSaveRealm(accessToken: string, failOnStatusCode = true): ResponseT<any> {
    const realm = getRealmJson();

    // @ts-ignore
    return cy.task('keycloakRequest', {
        baseUrl: `${keycloakBaseUrl}/auth/admin/realms`,
        method: 'POST',
        data: realm,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    }).then((response: Cypress.Response<any>) => {
        if (failOnStatusCode) {
            expect(response.status).to.equal(201);
        }

        return cy.wrap(response);
    });
}

Cypress.Commands.add('apiKeycloakSaveRealm', apiKeycloakSaveRealm);

function apiKeycloakGetRealm(accessToken: string, failOnStatusCode = true): ResponseT<any> {
    // @ts-ignore
    return cy.task('keycloakRequest', {
        baseUrl: `${keycloakBaseUrl}/auth/admin/realms/${keycloakAppName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        failOnStatusCode,
    }).then((response: Cypress.Response<any>) => {
        if (failOnStatusCode) {
            expect(response.status).to.equal(200);
        }

        return cy.wrap(response);
    });
}

Cypress.Commands.add('apiKeycloakGetRealm', apiKeycloakGetRealm);

function apiRequireKeycloak(): any {
    return cy.apiKeycloakGetAccessToken().then((token) => {
        return cy.apiKeycloakGetRealm(token, false).then((response) => {
            if (response.status !== 200) {
                return cy.apiKeycloakSaveRealm(token);
            }

            return response;
        });
    });
}
Cypress.Commands.add('apiRequireKeycloak', apiRequireKeycloak);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Get access token from Keycloak
             * See https://www.keycloak.org/documentation
             * @returns {string} token
             *
             * @example
             *   cy.apiKeycloakGetAccessToken();
             */
            apiKeycloakGetAccessToken: typeof apiKeycloakGetAccessToken;

            /**
             * Save realm to Keycloak
             * See https://www.keycloak.org/documentation
             * @param {string} options.accessToken - valid token to authorize a request
             * @param {Boolean} options.failOnStatusCode - whether to fail on status code, default is true
             * @returns {Response} response: Cypress-chainable response
             *
             * @example
             *   cy.apiKeycloakSaveRealm('access-token');
             */
            apiKeycloakSaveRealm: typeof apiKeycloakSaveRealm;

            /**
             * Get realm from Keycloak
             * See https://www.keycloak.org/documentation
             * @param {string} options.accessToken - valid token to authorize a request
             * @param {Boolean} options.failOnStatusCode - whether to fail on status code, default is true
             * @returns {Response} response: Cypress-chainable response
             *
             * @example
             *   cy.apiKeycloakGetRealm('access-token');
             */
            apiKeycloakGetRealm: typeof apiKeycloakGetRealm;

            /**
             * Verify Keycloak is reachable and has realm setup
             * See https://www.keycloak.org/documentation
             * @returns {Response} response: Cypress-chainable response
             *
             * @example
             *   cy.apiRequireKeycloak();
             */
            apiRequireKeycloak: typeof apiRequireKeycloak;
        }
    }
}
