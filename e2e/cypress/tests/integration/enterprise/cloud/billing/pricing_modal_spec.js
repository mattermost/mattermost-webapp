// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

function simulateSubscription(subscription) {
    cy.intercept('GET', '**/api/v4/cloud/subscription', {
        statusCode: 200,
        body: subscription,
    });

    cy.intercept('GET', '**/api/v4/cloud/products', {
        statusCode: 200,
        body: [
            {
                id: 'prod_1',
                sku: 'cloud-starter',
                price_per_seat: 0,
                name: 'Cloud Starter',
            },
            {
                id: 'prod_2',
                sku: 'cloud-professional',
                price_per_seat: 10,
                name: 'Cloud Professional',
            },
            {
                id: 'prod_3',
                sku: 'cloud-enterprise',
                price_per_seat: 30,
                name: 'Cloud Enterprise',
            },
        ],
    });

    cy.intercept('**/api/v4/config/client?format=old', (req) => {
        req.reply((res) => {
            const config = {...res.body};
            config.FeatureFlagCloudFree = 'true';
            res.send(config);
        });
    });
}

describe('Pricing modal', () => {
    let urlL;

    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');
    });

    it('should show Upgrade button in global header for non admin users', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };
        cy.apiInitSetup().then(({user, offTopicUrl: url}) => {
            urlL = url;
            simulateSubscription(subscription);
            cy.apiLogin(user);
            cy.visit(url);
        });

        // * Check that Upgrade button does show
        cy.get('#UpgradeButton').should('exist');
    });

    it('should show Upgrade button in global header for admin users and starter sku', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };
        simulateSubscription(subscription);
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // * Check that Upgrade button shows for admins
        cy.get('#UpgradeButton').should('exist');
    });

    it('should show Upgrade button in global header for admin users and enterprise trial sku', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_3',
            is_free_trial: 'true',
        };
        simulateSubscription(subscription);
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // * Check that Upgrade button shows for admins
        cy.get('#UpgradeButton').should('exist');
    });

    it('should open pricing modal when Upgrade button clicked while in starter sku', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };
        simulateSubscription(subscription);
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // # Open the pricing modal
        cy.get('#UpgradeButton').should('exist').click();

        // *Pricing modal should be open
        cy.get('#pricingModal').should('exist');
        cy.get('#pricingModal').get('.PricingModal__header').contains('Select a plan');

        // *Check that starter card Upgrade button is disabled
        cy.get('#pricingModal').get('#starter').get('#starter_action').should('be.disabled').contains('Upgrade');

        // *Check that professsional card Upgrade button opens purchase modal
        cy.get('#pricingModal').get('#professional').get('#professional_action').click();
        cy.get('.PurchaseModal').should('exist');

        // *Close PurchaseModal
        cy.get('.close-x').click();

        // #Open pricing modal again
        cy.get('#UpgradeButton').should('exist').click();

        // *Check for contact sales CTA
        cy.get('#contact_sales_quote').contains('Contact Sales for a quote');

        // *Check that enterprise card action button opens LearnMoreTrialModal
        cy.get('#pricingModal').get('#enterprise').get('#enterprise_action').contains('Try free for 30 days');
        cy.get('#pricingModal').get('#enterprise').get('#enterprise_action').click();
        cy.get('.LearnMoreTrialModal').should('exist');
    });

    it('should open pricing modal when Upgrade button clicked while in enterprise trial sku', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_3',
            is_free_trial: 'true',
        };
        simulateSubscription(subscription);
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // # Open the pricing modal
        cy.get('#UpgradeButton').should('exist').click();

        // *Pricing modal should be open
        cy.get('#pricingModal').should('exist');
        cy.get('#pricingModal').get('.PricingModal__header').contains('Select a plan');

        // *Check that starter card Upgrade button is disabled
        cy.get('#pricingModal').get('#starter').get('#starter_action').should('be.disabled').contains('Upgrade');

        // *Check that professsional card Upgrade button opens purchase modal
        cy.get('#pricingModal').get('#professional').get('#professional_action').click();
        cy.get('.PurchaseModal').should('exist');

        // *Close PurchaseModal
        cy.get('.close-x').click();

        // *Check that enterprise card action button is disabled
        cy.get('#UpgradeButton').should('exist').click();
        cy.get('#pricingModal').get('#enterprise').get('#enterprise_action').contains('Try free for 30 days');
        cy.get('#pricingModal').get('#enterprise').get('#enterprise_action').should('be.disabled');
    });

    it('should open pricing modal when Upgrade button clicked while in post trial starter sku', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
            trial_end_at: 100000000, // signifies that this subscription has trialled before
        };
        simulateSubscription(subscription);
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // # Open the pricing modal
        cy.get('#UpgradeButton').should('exist').click();

        // *Pricing modal should be open
        cy.get('#pricingModal').should('exist');
        cy.get('#pricingModal').get('.PricingModal__header').contains('Select a plan');

        // *Check that starter card Upgrade button is disabled
        cy.get('#pricingModal').get('#starter').get('#starter_action').should('be.disabled').contains('Upgrade');

        // *Check that professsional card Upgrade button opens purchase modal
        cy.get('#pricingModal').get('#professional').get('#professional_action').click();
        cy.get('.PurchaseModal').should('exist');

        // *Close PurchaseModal
        cy.get('.close-x').click();

        // * Contact Sales button shows and Contact sales for quote CTA should not show
        cy.get('#UpgradeButton').should('exist').click();
        cy.get('#contact_sales_quote').should('not.exist');
        cy.get('#pricingModal').get('#enterprise').get('#enterprise_action').contains('Contact Sales');
    });

    it('should open cloud limits modal when starter disclaimer CTA is clicked', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
            trial_end_at: 100000000, // signifies that this subscription has trialled before
        };
        simulateSubscription(subscription);
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // # Open the pricing modal
        cy.get('#UpgradeButton').should('exist').click();

        // * Pricing modal should be open
        cy.get('#pricingModal').should('exist');
        cy.get('#pricingModal').get('.PricingModal__header').contains('Select a plan');

        // * Open cloud limits modal
        cy.get('#pricingModal').get('#starter_plan_data_restrictions_cta').contains('This plan has data restrictions.');
        cy.get('#pricingModal').get('#starter_plan_data_restrictions_cta').click();

        cy.get('.CloudUsageModal').should('exist');
        cy.get('.CloudUsageModal').contains('Cloud Starter limits');
    });
});
