// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

Cypress.Commands.add('uiCheckLicenseExists', () => {
    // # Go to system admin then verify admin console URL, header, and content
    cy.visit('/admin_console/about/license');
    cy.url().should('include', '/admin_console/about/license');
    cy.get('.admin-console', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').within(() => {
        cy.get('.admin-console__header').should('be.visible').and('have.text', 'Edition and License');
        cy.get('.admin-console__content').should('be.visible').and('not.contain', 'undefined').and('not.contain', 'Invalid');
        cy.get('#remove-button').should('be.visible');
    });
});
