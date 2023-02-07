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
        cy.get('#free_action').contains('Downgrade').should('exist').should('be.enabled').click();

        // * Downgrade feedback should exist.
        cy.findByText('Please share your reason for downgrading').should('exist');

        // * The downgrade button should be disabled until feedback is provided.
        cy.findByText('Downgrade').should('exist').should('be.disabled').click();

        // # Click the free action (downgrade).
        cy.findByTestId('Exploring other solutions').click();

        // # Click the submit for the downgrade feedback.
        cy.findByText('Downgrade').should('exist').should('be.enabled').click();

        // * The downgrade modal should exist.
        cy.findByText('Downgrading your workspace').should('exist');
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
        cy.get('#free_action').contains('Downgrade').should('exist').should('be.enabled').click();

        // * Downgrade feedback should exist.
        cy.findByText('Please share your reason for downgrading').should('exist');

        // * The submit button should be disabled.
        cy.findByText('Downgrade').should('exist').should('be.disabled');
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
        // # Click free action to downgrade.
        cy.get('#free_action').contains('Downgrade').should('exist').should('be.enabled').click();

        // * Downgrade feedback should exist.
        cy.findByText('Please share your reason for downgrading').should('exist');

        // * The submit button should be disabled.
        cy.findByText('Downgrade').should('exist').should('be.disabled');

        // # Click the other option, requiring extra comments.
        cy.get('input[value="Other"]').click();

        cy.findByText('Downgrade').should('exist').should('be.disabled').click();

        cy.findByTestId('FeedbackModal__TextInput').type('Do not need it anymore.');

        // * The submit button should be enabled.
        cy.findByText('Downgrade').should('exist').should('be.enabled').click();
    });
});
