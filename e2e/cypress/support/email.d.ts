// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {

        /**
         * getRecentEmail is a task to get an email sent to a user
         * from the email service provider
         * @param options.username - username of the user
         * @param options.email - email of the user
         *
         * @example
         *   cy.getRecentEmail().then((data) => {
         *       // do something with the email data/content
         *   });
         */
        getRecentEmail(options: {user: Pick<UserProfile, 'username' | 'email'>}): Chainable;
    }
}
