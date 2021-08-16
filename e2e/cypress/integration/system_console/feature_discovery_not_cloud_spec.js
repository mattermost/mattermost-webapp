// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @te_only @system_console @not_cloud

describe('Feature discovery', () => {
    before(() => {
        cy.shouldRunOnTeamEdition();
        cy.shouldNotRunOnCloudEdition();

        // # Visit admin console
        cy.visit('/admin_console');
    });

    it('for on-prem prompts user to start trial', () => {
        cy.shouldNotRunOnCloudEdition();

        cy.get('li').contains('AD/LDAP').click();
        cy.get("button[data-testid='featureDiscovery_primaryCallToAction']").should('contain', 'Start trial');
        cy.get('.trial-legal-terms').should('contain', 'agree to');
    });
});
