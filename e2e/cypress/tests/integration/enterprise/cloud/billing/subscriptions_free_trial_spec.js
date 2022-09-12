// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @cloud_only @cloud_trial
// Skip:  @headless @electron // run on Chrome (headed) only

import billing from '../../../../fixtures/client_billing.json';

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

describe('System Console - Subscriptions section', () => {
    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');
    });

    beforeEach(() => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'true',
        };
        simulateSubscription(subscription);

        // # Visit Subscription page
        cy.visit('/admin_console/billing/subscription');
    });

    it('MM-T4118 Subscription page UI check', () => {
        // * Check for Subscription header
        cy.contains('.admin-console__header', 'Subscription').should('be.visible');

        // * Check for visibility of Trial tag
        cy.contains('span', 'trial', {timeout: 10000}).should('be.visible');

        // * Check for User count
        cy.request('/api/v4/analytics/old?name=standard&team_id=').then((response) => {
            cy.get('.PlanDetails__userCount > span').invoke('text').then((text) => {
                const userCount = response.body.find((obj) => obj.name === 'unique_user_count');
                expect(text).to.contain(userCount.value);
            });
        });

        // * Check for See how billing works navigation
        cy.contains('span', 'See how billing works').parent().then((link) => {
            const getHref = () => link.prop('href');
            cy.wrap({href: getHref}).invoke('href').should('contains', '/cloud-billing.html');
            cy.wrap(link).should('have.attr', 'target', '_blank');
            cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
            cy.request(link.prop('href')).its('status').should('eq', 200);
        });
    });

    it('MM-T4122 "Upgrade now" navigation and closing of Upgrade window', () => {
        // # Click on Upgrade Now button
        cy.contains('span', 'Upgrade Now').parent().click();
        cy.get('#professional_action').click();

        // * Check for "Provide Your Payment Details" label
        cy.get('.title').find('span', 'Provide Your Payment Details').should('be.visible');

        // # Click on close button of Upgrade window
        cy.get('#closeIcon').parent().should('exist').click();

        // * Check for "You're currently on a free trial" label
        // cy.contains('span', "You're currently on a free trial").should('be.visible');
    });

    it('MM-T4124 Purchase modal UI check', () => {
        // # Click on Upgrade Now button
        cy.contains('span', 'Upgrade Now').parent().click();

        cy.get('#professional_action').click();

        // * Check for "Provide Your Payment Details" label
        cy.get('.title').find('span', 'Provide Your Payment Details').should('be.visible');

        // * Check for Compare plans navigation
        cy.contains('span', 'Compare plans').click();

        cy.findByRole('heading', {name: 'Select a plan'}).should('be.visible');
        cy.findByRole('button', {name: 'Close'}).click();

        // * Check for See how billing works navigation
        cy.contains('span', 'See how billing works').should('be.visible');
    });

    it('MM-T4128 Enable/disable "Upgrade" button in Purchase modal', () => {
        // # Click on Upgrade Now button
        cy.contains('span', 'Upgrade Now').parent().click();

        // # Click on Upgrade Now button on plans modal
        cy.get('#professional_action').click();

        // * Check for "Provide Your Payment Details" label
        cy.get('.title').find('span', 'Provide Your Payment Details').should('be.visible');

        // # Enter card details
        cy.uiGetPaymentCardInput().within(() => {
            cy.get('[name="cardnumber"]').should('be.enabled').clear().type(billing.visa.cardNumber);
            cy.get('[name="exp-date"]').should('be.enabled').clear().type(billing.visa.expDate);
            cy.get('[name="cvc"]').should('be.enabled').clear().type(billing.visa.cvc);
        });
        cy.get('#input_name').clear().type('test name');
        cy.findByText('Country').parent().find('.icon-chevron-down').click();
        cy.findByText('Country').parent().find("input[type='text']").type('India{enter}', {force: true});
        cy.get('#input_address').type('test1');
        cy.get('#input_address2').type('test2');
        cy.get('#input_city').clear().type('testcity');
        cy.get('#input_state').type('test');
        cy.get('#input_postalCode').type('444');

        // * Check for enable status of Upgrade button
        cy.get('.RHS').find('button').should('be.enabled');

        // # Enter invalid csv
        cy.uiGetPaymentCardInput().within(() => {
            cy.get('[name="cvc"]').clear().type(billing.invalidvisa.cvc);
        });
        cy.get('#input_name').clear().type('test user');
        cy.get('.RHS').find('button').should('be.disabled');

        // # Enter billing details
        cy.findByText('Country').parent().find('.icon-chevron-down').click();
        cy.findByText('Country').parent().find("input[type='text']").type('India{enter}', {force: true});
        cy.get('.RHS').find('button').should('be.disabled');
        cy.get('#input_address').type('test1');
        cy.get('#input_address2').type('test2');
        cy.get('#input_city').clear().type('testcity');
        cy.get('.RHS').find('button').should('be.disabled');
        cy.get('#input_state').type('test');
        cy.get('.RHS').find('button').should('be.disabled');
        cy.get('#input_postalCode').type('444');

        // # Enter invalid card details
        cy.uiGetPaymentCardInput().within(() => {
            cy.get('[name="cardnumber"]').should('be.enabled').clear().type(billing.invalidvisa.cardNumber);
            cy.get('[name="exp-date"]').should('be.enabled').clear().type(billing.visa.expDate);
            cy.get('[name="cvc"]').should('be.enabled').clear().type(billing.visa.cvc);
        });
        cy.get('#input_name').clear().type('test user');

        // * Check for disabled Upgrade button for having wrong card details
        cy.get('.RHS').find('button').should('be.disabled');
    });
});
