// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable<Subject = any> {

        /**
         * Visit the given url, same as cy.visit but extended with explicit wait to allow page to load freely
         * @param url — The URL to visit. If relative uses baseUrl
         * @param options — Pass in an options object to change the default behavior of cy.visit()
         * @param duration — wait duration with 3 seconds by default
         *
         * @example
         *   cy.visitAndWait('url');
         */
        visitAndWait(url: string, options?: Partial<Cypress.VisitOptions>, duration?: number): Chainable;
    }
}
