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
         * Login to server via API.
         * See https://api.mattermost.com/#tag/users/paths/~1users~1login/post
         * @param {string} user.username - username of a user
         * @param {string} user.password - password of  user
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         * @returns {UserProfile} response.body: `UserProfile` object
         *
         * @example
         *   cy.apiLogin({username: 'sysadmin', password: 'secret'});
         */
        apiLogin(user: UserProfile): Chainable<Response>;

        /**
         * Logout a user's active session from server via API.
         * See https://api.mattermost.com/#tag/users/paths/~1users~1logout/post
         * Clears all cookies espececially `MMAUTHTOKEN`, `MMUSERID` and `MMCSRF`.
         *
         * @example
         *   cy.apiLogout();
         */
        apiLogout();

        /**
         * Creates an admin account based from the env variables defined in Cypress env
         * @param {string} options.namePrefix - 'user' (default) or any prefix to easily identify a user
         * @param {boolean} options.bypassTutorial - true (default) or false for user to go thru tutorial steps
         * @returns {Object} `out` Cypress-chainable, yielded with element passed into .wrap().
         * @returns {UserProfile} `out.sysadmin` as `UserProfile` object
         *
         * @example
         *   cy.apiCreateAdmin(options);
         */
        apiCreateAdmin(options: Record<string, any>): Chainable<Record<string, any>>;

        /**
         * Creates a new user with an options to set name prefix and be able to bypass tutorial steps
         * @param {string} options.user - predefined `user` object instead on random user
         * @param {string} options.prefix - 'user' (default) or any prefix to easily identify a user
         * @param {boolean} options.bypassTutorial - true (default) or false for user to go thru tutorial steps
         * @returns {Object} `out` Cypress-chainable, yielded with element passed into .wrap().
         * @returns {UserProfile} `out.user` as `UserProfile` object
         *
         * @example
         *   cy.apiCreateUser(options);
         */
        apiCreateUser(options: Record<string, any>): Chainable<Record<string, any>>;

        /**
         * Creates a new guest user with an options to set name prefix and be able to bypass tutorial steps
         * @param {string} options.prefix - 'guest' (default) or any prefix to easily identify a guest
         * @param {string} options.activate - true (default) to activate guest user
         * @param {boolean} options.bypassTutorial - true (default) or false for guest to go thru tutorial steps
         * @returns {Object} `out` Cypress-chainable, yielded with element passed into .wrap().
         * @returns {UserProfile} `out.guest` as `UserProfile` object
         *
         * @example
         *   cy.apiCreateGuestUser(options);
         */
        apiCreateGuestUser(options: Record<string, any>): Chainable<Record<string, any>>;
    }
}
