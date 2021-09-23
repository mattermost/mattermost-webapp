// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @cloud_only @cloud_trial
// Skip:  @headless @electron // run on Chrome (headed) only

describe('System Console - Payment Information section', () => {
    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');

        // # Visit Subscription page
        cy.visit('/admin_console/billing/subscription');

        // * Check for Subscription header
        cy.contains('.admin-console__header', 'Subscription').should('be.visible');
    });

    it('MM-T4120 Validate non existence of Payment Information menu should during the trial period', () => {
        // * Check for visibility of payment information menu
        cy.get('#billing\\/payment_info', {timeout: 10000}).should('not.exist');
    });
});

