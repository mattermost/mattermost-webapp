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
// Custom command should follow naming convention of having `visual` prefix, e.g. `visualEyesOpen`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable<Subject = any> {

        /**
         * A wrapper that creates an Applitools test. This will start a session with the Applitools server.
         * See https://github.com/applitools/eyes.sdk.javascript1/tree/master/packages/eyes-cypress#open
         * @param {Object} options - Applitools options.  See https://github.com/applitools/eyes.sdk.javascript1/tree/master/packages/eyes-cypress#advanced-configuration
         *
         * @example
         *   cy.visualEyesOpen(options);
         */
        visualEyesOpen(options: Record<string, any>): Chainable;

        /**
         * A wrapper that closes the Applitools test and check that all screenshots are valid.
         * See https://github.com/applitools/eyes.sdk.javascript1/tree/master/packages/eyes-cypress#close
         *
         * @example
         *   cy.visualEyesClose();
         */
        visualEyesClose(): Chainable;

        /**
         * A wrapper that generates a screenshot of the current page and add it to the Applitools Test.
         * See https://github.com/applitools/eyes.sdk.javascript1/tree/master/packages/eyes-cypress#check-window
         * @param {Object} options - Applitools options.  See above reference.
         *
         * @example
         *   cy.visualSaveSnapshot(options);
         */
        visualSaveSnapshot(options: Record<string, any>): Chainable;
    }
}
