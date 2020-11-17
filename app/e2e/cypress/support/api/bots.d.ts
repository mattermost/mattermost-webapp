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
         * Create a bot.
         * See https://api.mattermost.com/#tag/bots/paths/~1bots/post
         * @param {string} username - The bots username
         * @param {string} displayName - The non-unique UI name for the bot
         * @param {string} description - The description of the bot
         * @returns {Bot} out.bot: `Bot` object
         *
         * @example
         *   cy.apiCreateBot().then(({bot}) => {
         *       // do something with bot
         *   });
         */
        apiCreateBot(): Chainable<Bot>;

        /**
         * Get bots.
         * See https://api.mattermost.com/#tag/bots/paths/~1bots/get
         * @returns {Bot[]} out.bots: `Bot[]` object
         *
         * @example
         *   cy.apiGetBots();
         */
        apiGetBots(): Chainable<Bot[]>;
    }
}
