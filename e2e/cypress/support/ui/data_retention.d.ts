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
// ***************************************************************

declare namespace Cypress {
    interface Chainable {
        /**
         * Go to Data Retention Page
         */
        uiGoToDataRetentionPage(): Chainable;

        /**
         * Click create policy button
         */
        uiClickCreatePolicy(): Chainable;

        /**
         * Fill out custom policy form fields
         */
        uiFillOutCustomPolicyFields(name: string, durationDropdown: string, durationText: string): Chainable;

        /**
         * Add teams to custom policy
         */
        uiAddTeamsToCustomPolicy(teamNames: string[]): Chainable;

        /**
         * Add channels to custom policy
         */
        uiAddChannelsToCustomPolicy(channelNames: string[]): Chainable;
    }
}
