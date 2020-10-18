// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="cypress" />

// ***************************************************************
// Each command should be properly documented using JSDoc.
// See https://jsdoc.app/index.html for reference.
// Basic requirements for documentation are the following:
// - Meaningful description
// - Specific link to https://api.mattermost.com
// - Each parameter with `@params`
// - Return value with `@returns`
// - Example usage with `@example`
// Custom command should follow naming convention of having `api` prefix, e.g. `apiLogin`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable<Subject = any> {

        /**
         * Get client license.
         * See https://api.mattermost.com/#tag/system/paths/~1license~1client/get
         * @returns {ClientLicense} `out.license` as `ClientLicense`
         *
         * @example
         *   cy.apiGetClientLicense().then(({license}) => {
         *       // do something with license
         *   });
         */
        apiGetClientLicense(): Chainable<ClientLicense>;

        /**
         * Verifies if server has license for a certain feature and fail test if not found.
         * @param {string} feature - feature to check, e.g. 'LDAP'
         * @returns {ClientLicense} `out.license` as `ClientLicense`
         *
         * @example
         *   cy.apiRequireLicenseForFeature('LDAP');
         */
        apiRequireLicenseForFeature(feature: string): Chainable<ClientLicense>;

        /**
         * Verifies if server has license and fail test if not found.
         * @returns {ClientLicense} `out.license` as `ClientLicense`
         *
         * @example
         *   cy.apiRequireLicense();
         */
        apiRequireLicense(): Chainable<ClientLicense>;

        /**
         * Update configuration.
         * See https://api.mattermost.com/#tag/system/paths/~1config/put
         * @param {AdminConfig} newConfig - new config
         * @returns {AdminConfig} `out.config` as `AdminConfig`
         *
         * @example
         *   cy.apiUpdateConfig().then(({config}) => {
         *       // do something with config
         *   });
         */
        apiUpdateConfig(newConfig: AdminConfig): Chainable<AdminConfig>;

        /**
         * Get configuration.
         * See https://api.mattermost.com/#tag/system/paths/~1config/get
         * @returns {AdminConfig} `out.config` as `AdminConfig`
         *
         * @example
         *   cy.apiGetConfig().then(({config}) => {
         *       // do something with config
         *   });
         */
        apiGetConfig(): Chainable<AdminConfig>;

        /**
         * Get analytics.
         * See https://api.mattermost.com/#tag/system/paths/~1analytics~1old/get
         * @returns {AnalyticsRow[]} `out.analytics` as `AnalyticsRow[]`
         *
         * @example
         *   cy.apiGetAnalytics().then(({analytics}) => {
         *       // do something with analytics
         *   });
         */
        apiGetAnalytics(): Chainable<AnalyticsRow[]>;

        /**
         * Invalidate all the caches.
         * See https://api.mattermost.com/#tag/system/paths/~1caches~1invalidate/post
         * @returns {Object} `out.data` as response status
         *
         * @example
         *   cy.apiInvalidateCache();
         */
        apiInvalidateCache(): Chainable<Record<string, any>>;
    }
}
