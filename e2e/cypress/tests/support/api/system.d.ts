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
    interface Chainable {

        /**
         * Remove the license file from the server. This will disable all enterprise features.
         * See https://api.mattermost.com/#tag/system/paths/~1license/delete
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         *
         * @example
         *   cy.apiDeleteLicense();
         */
        apiDeleteLicense(): Chainable<Response>;


        /**
         * Reload the configuration file to pick up on any changes made to it.
         * See https://api.mattermost.com/#tag/system/paths/~1config~1reload/post
         * @returns {AdminConfig} `out.config` as `AdminConfig`
         *
         * @example
         *   cy.apiReloadConfig().then(({config}) => {
         *       // do something with config
         *   });
         */
        apiReloadConfig(): Chainable<AdminConfig>;


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

        /**
         * Allow test for server other than Cloud edition or with Cloud license.
         * Otherwise, fail fast.
         * @example
         *   cy.shouldNotRunOnCloudEdition();
         */
        shouldNotRunOnCloudEdition(): Chainable;

        /**
         * Allow test for server on Team edition or without license.
         * Otherwise, fail fast.
         * @example
         *   cy.shouldRunOnTeamEdition();
         */
        shouldRunOnTeamEdition(): Chainable;

        /**
         * Allow test for server with Plugin upload enabled.
         * Otherwise, fail fast.
         * @example
         *   cy.shouldHavePluginUploadEnabled();
         */
        shouldHavePluginUploadEnabled(): Chainable;

        /**
         * Allow test for server running with subpath.
         * Otherwise, fail fast.
         * @example
         *   cy.shouldRunWithSubpath();
         */
        shouldRunWithSubpath(): Chainable;

        /**
         * Allow test if matches feature flag setting
         * Otherwise, fail fast.
         *
         * @param {string} feature - feature name
         * @param {string} expectedValue - expected value
         *
         * @example
         *   cy.shouldHaveFeatureFlag('feature', 'expected-value');
         */
        shouldHaveFeatureFlag(feature: string, expectedValue: any): Chainable;
    }
}
