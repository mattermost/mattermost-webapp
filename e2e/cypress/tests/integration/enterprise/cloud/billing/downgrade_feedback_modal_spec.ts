// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @cloud_only @cloud_trial
describe('Feedback modal', () => {
    it('Should display feedback modal when downgrading to cloud free', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.apiLogout();
        cy.apiAdminLogin();

        // # Open the pricing modal
        cy.visit('/admin_console/billing/subscription?action=show_pricing_modal');

        // * Pricing modal should be open
        cy.get('#pricingModal').should('exist');

        // * Free action (downgrade) should exist.
        cy.get('#free').should('exist');

        // # Click the free action (downgrade).
        cy.get('#free_action').should('be.enabled').click();

        // * Downgrade feedback should exist.
        cy.get('.DowngradeFeedback__Submit').should('exist');

        // # Click the free action (downgrade).
        cy.get('input[name="downgradeFeedbackRadioGroup"]').first().click();

        // # Click the submit for the downgrade feedback.
        cy.get('.DowngradeFeedback__Submit > button').should('exit').should('be.enabled').click();

        // * The downgrade modal should exist.
        cy.get('div.DowngradeTeamRemovalModal__body').should('exist');
    });

    it('Downgrade Feedback modal submit button should be disabled if not option is selected', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.apiLogout();
        cy.apiAdminLogin();

        // # Open the pricing modal
        cy.visit('/admin_console/billing/subscription?action=show_pricing_modal');

        // * Pricing modal should be open
        cy.get('#pricingModal').should('exist');

        // * Free action (downgrade) should exist.
        cy.get('#free').should('exist');

        // # Click the free action (downgrade).
        cy.get('#free_action').should('be.enabled').click();

        // * Downgrade feedback should exist.
        cy.get('.DowngradeFeedback__Submit').should('exist');

        // * The submit button should be disabled.
        cy.get('.DowngradeFeedback__Submit > button').should('exit').should('be.disabled');
    });

    it('Downgrade Feedback modal shows error state when "other" option is selected but not comments have been provided', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.apiLogout();
        cy.apiAdminLogin();

        // # Open the pricing modal
        cy.visit('/admin_console/billing/subscription?action=show_pricing_modal');

        // * Pricing modal should be open
        cy.get('#pricingModal').should('exist');

        // * Free action (downgrade) should exist.
        cy.get('#free').should('exist');

        // # Click the free action (downgrade).
        cy.get('#free_action').should('be.enabled').click();


        // * Downgrade feedback should exist.
        cy.get('.DowngradeFeedback__Submit').should('exist');

        // # Click the other option, requiring extra comments.
        cy.get('input[value="Other"]').click();
        
        // * The submit button should be disabled.
        cy.get('.DowngradeFeedback__Submit > button').should('exit').should('be.enabled').click();

        cy.get('.DowngradeFeedback__Error').should('be.visible');
    });
});