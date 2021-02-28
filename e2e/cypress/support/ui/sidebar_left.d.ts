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
// Custom command should follow naming convention of having `ui` prefix, e.g. `uiCheckLicenseExists`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable {

        /**
         * Get LHS section
         * @param {string} section - section such as UNREADS, CHANNELS, FAVORITES, DIRECT MESSAGES and other custom category
         *
         * @example
         *   cy.uiGetLhsSection('CHANNELS');
         */
        uiGetLhsSection(section: string): Chainable;

        /**
         * Open menu to browse or create channel
         * @param {string} item - dropdown menu. If set, it will do click action.
         *
         * @example
         *   cy.uiBrowseOrCreateChannel('Browse Channels');
         */
        uiBrowseOrCreateChannel(item: string): Chainable;

        /**
         * Get "+" button to write a direct message
         * @example
         *   cy.uiAddDirectMessage();
         */
        uiAddDirectMessage(): Chainable;

        /**
         * Get a button for channel switcher
         * @example
         *   cy.uiGetChannelSwitcher();
         */
        uiGetChannelSwitcher(): Chainable;

        /**
         * Open menu of a channel in the sidebar
         * @param {string} channelName - name of channel, ex. 'town-square'
         *
         * @example
         *   cy.uiGetChannelSidebarMenu('town-square');
         */
        uiGetChannelSidebarMenu(channelName: string): Chainable;
    }
}
