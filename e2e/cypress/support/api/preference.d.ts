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

        // *******************************************************************************
        // Preferences
        // https://api.mattermost.com/#tag/preferences
        // *******************************************************************************

        /**
         * Save a list of the user's preferences.
         * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/put
         * @param {PreferenceType[]} preferences - List of preference objects
         * @param {string} userId - User ID
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         *
         * @example
         *   cy.apiSaveUserPreference([{user_id: 'user-id', category: 'display_settings', name: 'channel_display_mode', value: 'full'}], 'user-id');
         */
        apiSaveUserPreference(preferences: PreferenceType[], userId: string): Chainable<Response>;

        /**
         * Get the full list of the user's preferences.
         * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/get
         * @param {string} userId - User ID
         * @returns {Response} response: Cypress-chainable response which should have a list of preference objects
         *
         * @example
         *   cy.apiGetUserPreference('user-id');
         */
        apiGetUserPreference(userId: string): Chainable<Response>;

        /**
         * Save clock display mode to 24-hour preference.
         * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/put
         * @param {boolean} is24Hour - true (default) or false for 12-hour
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         *
         * @example
         *   cy.apiSaveClockDisplayModeTo24HourPreference(true);
         */
        apiSaveClockDisplayModeTo24HourPreference(is24Hour: boolean): Chainable<Response>;

        /**
         * Save cloud onboarding preference.
         * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/put
         * @param {string} userId - User ID
         * @param {string} name - options are complete_profile, team_setup, invite_members or hide
         * @param {string} value - options are 'true' or 'false'
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         *
         * @example
         *   cy.apiSaveCloudOnboardingPreference('user-id', 'hide', 'true');
         */
        apiSaveCloudOnboardingPreference(userId: string, name: string, value: string): Chainable<Response>;

        /**
         * Save hiding of What's New modal.
         * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/put
         * @param {string} userId - User ID
         * @param {string} value - options are 'true' to hide or 'false' to show
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         *
         * @example
         *   cy.apiHideSidebarWhatsNewModalPreference('user-id', 'true');
         */
        apiHideSidebarWhatsNewModalPreference(userId: string, name: string): Chainable<Response>;
    }
}
