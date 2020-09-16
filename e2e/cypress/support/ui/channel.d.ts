// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="cypress" />

// ***************************************************************
// Each command should be properly documented using JSDoc.
// See https://jsdoc.app/index.html for reference.
// Basic requirements for documentation are the following:
// - Meaningful description
// - Each parameter with `@params`
// - Return value with `@returns`
// - Example usage with `@example`
// Custom command should follow naming convention of having `ui` prefix, e.g. `uiCloseModal`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable<Subject = any> {

        /**
       * Create a new channel in the current team.
       * @param {string} name - Prefix for the name of the channel, it will be added a random string ot it.
       * @param {boolean} isPrivate - is the channel private or public (default)?
       * @param {string} purpose - Channel's purpose
       * @param {string} header - Channel's header
       * @param {boolean} isNewSidebar) - the new sidebar has a different ui flow, set this setting to true to use that. Defaults to false.
       * @returns {Response} Cypress chainable response. It should contain the final name of the channel.
       *
       * @example
       *   cy.uiCreateChannel('private-channel-', true, 'my private channel', 'my private header', false);
       */
        uiCreateChannel(name: string, isPrivate: boolean, purpose: string, header: string, isNewSidebar: false): Chainable;

        /**
       *
       * @param {string[]} usernameList - list of userids to add to the channel
       * @returns {Response} Cypress chainable response.
       *
       * @example
       *    cy.uiAddUsersToCurrentChannel(['user1', 'user2']);
       */
        uiAddUsersToCurrentChannel(usernameList: string[]);

        /**
       * Archives a channel
       *
       * @returns {Response} Cypress chainable response.
       */
        uiArchiveChannel();

    }
}
