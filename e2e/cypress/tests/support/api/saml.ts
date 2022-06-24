// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// *****************************************************************************
// SAML
// https://api.mattermost.com/#tag/SAML
// *****************************************************************************
import {ResponseT} from './types';

function apiGetSAMLCertificateStatus(): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/saml/certificate/status',
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiGetSAMLCertificateStatus', apiGetSAMLCertificateStatus);

function apiGetMetadataFromIdp(samlMetadataUrl: string): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/saml/metadatafromidp',
        method: 'POST',
        body: {saml_metadata_url: samlMetadataUrl},
    }).then((response) => {
        expect(response.status, 'Failed to obtain metadata from Identity Provider URL').to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiGetMetadataFromIdp', apiGetMetadataFromIdp);

function apiUploadSAMLIDPCert(filePath: string): ResponseT<any> {
    return cy.apiUploadFile('certificate', filePath, {url: '/api/v4/saml/certificate/idp', method: 'POST', successStatus: 200});
}
Cypress.Commands.add('apiUploadSAMLIDPCert', apiUploadSAMLIDPCert);

function apiUploadSAMLPublicCert(filePath: string): ResponseT<any> {
    return cy.apiUploadFile('certificate', filePath, {url: '/api/v4/saml/certificate/public', method: 'POST', successStatus: 200});
}
Cypress.Commands.add('apiUploadSAMLPublicCert', apiUploadSAMLPublicCert);

function apiUploadSAMLPrivateKey(filePath: string): ResponseT<any> {
    return cy.apiUploadFile('certificate', filePath, {url: '/api/v4/saml/certificate/private', method: 'POST', successStatus: 200});
}
Cypress.Commands.add('apiUploadSAMLPrivateKey', apiUploadSAMLPrivateKey);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Get the status of the uploaded certificates and keys in use by your SAML configuration.
             * See https://api.mattermost.com/#tag/SAML/paths/~1saml~1certificate~1status/get
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiGetSAMLCertificateStatus();
             */
            apiGetSAMLCertificateStatus: typeof apiGetSAMLCertificateStatus;

            /**
             * Get SAML metadata from the Identity Provider. SAML must be configured properly.
             * See https://api.mattermost.com/#tag/SAML/paths/~1saml~1metadatafromidp/post
             * @param {String} samlMetadataUrl - SAML metadata URL
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiGetMetadataFromIdp(samlMetadataUrl);
             */
            apiGetMetadataFromIdp: typeof apiGetMetadataFromIdp;

            /**
             * Upload the IDP certificate to be used with your SAML configuration. The server will pick a hard-coded filename for the IdpCertificateFile setting in your config.json.
             * See https://api.mattermost.com/#tag/SAML/paths/~1saml~1certificate~1idp/post
             * @param {String} filePath - path of the IDP certificate file relative to fixture folder
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   const filePath = 'saml-idp.crt';
             *   cy.apiUploadSAMLIDPCert(filePath);
             */
            apiUploadSAMLIDPCert: typeof apiUploadSAMLIDPCert;

            /**
             * Upload the public certificate to be used for encryption with your SAML configuration. The server will pick a hard-coded filename for the PublicCertificateFile setting in your config.json.
             * See https://api.mattermost.com/#tag/SAML/paths/~1saml~1certificate~1public/post
             * @param {String} filePath - path of the public certificate file relative to fixture folder
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   const filePath = 'saml-public.crt';
             *   cy.apiUploadSAMLPublicCert(filePath);
             */
            apiUploadSAMLPublicCert: typeof apiUploadSAMLPublicCert;

            /**
             * Upload the private key to be used for encryption with your SAML configuration. The server will pick a hard-coded filename for the PrivateKeyFile setting in your config.json.
             * See https://api.mattermost.com/#tag/SAML/paths/~1saml~1certificate~1private/post
             * @param {String} filePath - path of the private certificate file relative to fixture folder
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   const filePath = 'saml-private.crt';
             *   cy.apiUploadSAMLPrivateKey(filePath);
             */
            apiUploadSAMLPrivateKey: typeof apiUploadSAMLPrivateKey;
        }
    }
}
