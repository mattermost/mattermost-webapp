// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

function simulateSubscription(subscription, withLimits = true) {
    cy.intercept('GET', '**/api/v4/cloud/subscription', {
        statusCode: 200,
        body: subscription,
    });

    cy.intercept('GET', '**/api/v4/cloud/products**', {
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

    if (withLimits) {
        cy.intercept('GET', '**/api/v4/cloud/limits', {
            statusCode: 200,
            body: {
                messages: {
                    history: 10000,
                },
            },
        });
    }
}

describe('Pricing modal', () => {
    let urlL;

    // let createdUser;
    // let createdTeam;

    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');
    });

    it('should not show Upgrade button in global header for non admin users', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };
        cy.apiInitSetup().then(({user, offTopicUrl: url}) => {
            urlL = url;

            // createdUser = user;
            // createdTeam = team;
            simulateSubscription(subscription);
            cy.apiLogin(user);
            cy.visit(url);
        });

        // * Check that Upgrade button does not show
        cy.get('#UpgradeButton').should('not.exist');
    });

    // it('should not ping admin twice before cool off period', () => {
    //     const subscription = {
    //         id: 'sub_test1',
    //         product_id: 'prod_1',
    //         is_free_trial: 'false',
    //     };

    //     simulateSubscription(subscription);
    //     cy.apiLogout();
    //     cy.apiLogin(createdUser);
    //     cy.visit(urlL);

    //     // # Open the pricing modal
    //     cy.get('#UpgradeButton').should('exist').click();

    //     // # Click NotifyAdmin CTA
    //     cy.get('#notify_admin_cta').click();

    //     // * Check that notified the admin
    //     cy.get('#notify_admin_cta').contains('Notified!');

    //     // # Click NotifyAdmin CTA again
    //     cy.get('#notify_admin_cta').click();

    //     // * Notifying the admin again is forbidden depending on server notification cool off time
    //     cy.get('#notify_admin_cta').contains('Already notified!');
    // });

    // it('should ping admin when NotifyAdmin CTA is clicked for non admin users while in Starter', () => {
    //     const subscription = {
    //         id: 'sub_test1',
    //         product_id: 'prod_1',
    //         is_free_trial: 'false',
    //     };

    //     simulateSubscription(subscription);
    //     cy.apiLogout();
    //     cy.apiLogin(createdUser);
    //     cy.visit(urlL);

    //     // # Open the pricing modal
    //     cy.get('#UpgradeButton').should('exist').click();

    //     // # Click NotifyAdmin CTA
    //     cy.get('#notify_admin_cta').click();

    //     // * Check that notified the admin
    //     cy.get('#notify_admin_cta').contains('Notified!');

    //     // # Switch to admin view to check system-bot message
    //     cy.apiLogout();
    //     cy.apiAdminLogin();
    //     cy.visit(urlL);

    //     // # Open system-bot and admin DM
    //     cy.get('.SidebarChannelLinkLabel').contains('system-bot').click();

    //     // * Check for the post from the system-bot
    //     cy.getLastPostId().then((postId) => {
    //         cy.get(`#${postId}_message`).contains(`A member of ${createdTeam.name} has notified you to upgrade this workspace.`);
    //     });
    // });

    // it('should ping admin when NotifyAdmin CTA is clicked for non admin users while in Enterprise Trial', () => {
    //     const subscription = {
    //         id: 'sub_test1',
    //         product_id: 'prod_3',
    //         is_free_trial: 'true',
    //     };

    //     simulateSubscription(subscription);
    //     cy.apiLogout();
    //     cy.apiLogin(createdUser);
    //     cy.visit(urlL);

    //     // # Open the pricing modal
    //     cy.get('#UpgradeButton').should('exist').click();

    //     // # Click NotifyAdmin CTA
    //     cy.get('#notify_admin_cta').click();

    //     // * Check that notified the admin
    //     cy.get('#notify_admin_cta').contains('Notified!');

    //     // # Switch to admin view to check system-bot message
    //     cy.apiLogout();
    //     cy.apiAdminLogin();
    //     cy.visit(urlL);

    //     // # Open system-bot and admin DM
    //     cy.get('.SidebarChannelLinkLabel').contains('system-bot').click();

    //     // * Check for the post from the system-bot
    //     cy.getLastPostId().then((postId) => {
    //         cy.get(`#${postId}_message`).contains(`A member of ${createdTeam.name} has notified you to upgrade this workspace.`);
    //     });
    // });

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

        // *Check for Upgrade button tooltip
        cy.get('#UpgradeButton').trigger('mouseover').then(() => {
            cy.get('#upgrade_button_tooltip').should('be.visible').contains('Only visible to system admins');
        });
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

        // *Check that starter card Downgrade button is disabled
        cy.get('#pricingModal').get('#starter').get('#starter_action').should('be.disabled').contains('Downgrade');

        // *Check that professsional card Upgrade button opens purchase modal
        cy.get('#pricingModal').get('#professional').get('#professional_action').click();
        cy.get('.PurchaseModal').should('exist');

        // *Close PurchaseModal
        cy.get('.close-x').click();

        // #Open pricing modal again
        cy.get('#UpgradeButton').should('exist').click();

        // *Check for contact sales CTA
        cy.get('#contact_sales_quote').contains('Contact Sales');

        // *Check that enterprise card action button shows Try free for 30 days
        cy.get('#pricingModal').get('#enterprise').get('#start_cloud_trial_btn').contains('Try free for 30 days');
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

        // *Check that starter Downgrade card  button exists
        cy.get('#pricingModal').get('#starter').get('#starter_action').contains('Downgrade');

        // *Check that professsional card Upgrade button is not disabled while on enterprise trial
        cy.get('#pricingModal').get('#professional').get('#professional_action').should('not.be.disabled');

        // *Check that enterprise card action button is disabled
        cy.get('#pricingModal').get('#enterprise').get('#start_cloud_trial_btn').contains('Try free for 30 days');
        cy.get('#pricingModal').get('#enterprise').get('#start_cloud_trial_btn').should('be.disabled');
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

        // *Check that starter card Downgrade button is disabled
        cy.get('#pricingModal').get('#starter').get('#starter_action').should('be.disabled').contains('Downgrade');

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

    it('should not show starter disclaimer CTA when on legacy starter product that has no limits', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
            trial_end_at: 100000000, // signifies that this subscription has trialled before
        };
        simulateSubscription(subscription, false);
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // # Open the pricing modal
        cy.get('#UpgradeButton').should('exist').click();

        // * Pricing modal should be open
        cy.get('#pricingModal').should('exist');
        cy.get('#pricingModal').get('.PricingModal__header').contains('Select a plan');

        // * CTA should not show when there are no limits
        cy.get('#pricingModal').get('#starter_plan_data_restrictions_cta').should('not.exist');
    });

    it('should allow downgrades from professional plans', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        simulateSubscription(subscription);
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // # Open the pricing modal
        cy.visit('/admin_console/billing/subscription?action=show_pricing_modal');

        // *Pricing modal should be open
        cy.get('#pricingModal').should('exist');
        cy.get('#pricingModal').get('.PricingModal__header').contains('Select a plan');

        // *Check that starter card Downgrade button is disabled
        cy.get('#pricingModal').get('#starter').get('#starter_action').should('not.be.disabled').contains('Downgrade');
    });

    it('should not allow downgrades from enterprise trial', () => {
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

        // *Check that starter card Downgrade button is disabled
        cy.get('#pricingModal').get('#starter').get('#starter_action').should('be.disabled').contains('Downgrade');
    });

    it('should not allow downgrades from enterprise plans', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_3',
            is_free_trial: 'false',
        };
        simulateSubscription(subscription);
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // # Open the pricing modal
        cy.visit('/admin_console/billing/subscription?action=show_pricing_modal');

        // *Pricing modal should be open
        cy.get('#pricingModal').should('exist');
        cy.get('#pricingModal').get('.PricingModal__header').contains('Select a plan');

        // *Check that starter card Downgrade button is disabled
        cy.get('#pricingModal').get('#starter').get('#starter_action').should('be.disabled').contains('Downgrade');

        // *Check that professsional card Upgrade button is disabled while on non trial enterprise
        cy.get('#pricingModal').get('#professional').get('#professional_action').should('be.disabled');

        // *Check that Trial button is disabled on enterprise trial
        cy.get('#pricingModal').get('#enterprise').get('#start_cloud_trial_btn').should('be.disabled');
    });

    it('should not allow starting a trial from professional plans', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        simulateSubscription(subscription);
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // # Open the pricing modal
        cy.visit('/admin_console/billing/subscription?action=show_pricing_modal');

        // *Pricing modal should be open
        cy.get('#pricingModal').should('exist');
        cy.get('#pricingModal').get('.PricingModal__header').contains('Select a plan');

        // *Check that Trial button is disabled on enterprise trial
        cy.get('#pricingModal').get('#enterprise').get('#start_cloud_trial_btn').should('be.disabled');
    });
});
