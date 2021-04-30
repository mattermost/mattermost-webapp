// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../fixtures/timeouts';

export function verifyPluginMarketplaceVisibility(shouldBeVisible) {
    cy.wait(TIMEOUTS.HALF_SEC).get('#lhsHeader').should('be.visible').within(() => {
        // # Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').click();

        // * Verify dropdown menu should be visible
        cy.get('.dropdown-menu').should('be.visible').within(() => {
            if (shouldBeVisible) {
                // * Verify Marketplace button should exist
                cy.findByText('Marketplace').should('exist');
            } else {
                // * Verify Marketplace button should not exist
                cy.findByText('Marketplace').should('not.exist');
            }
        });
    });
}
