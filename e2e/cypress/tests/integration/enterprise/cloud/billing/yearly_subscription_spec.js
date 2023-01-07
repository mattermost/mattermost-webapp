// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @cloud_only @cloud_trial

import billing from '../../../../fixtures/client_billing.json';

function simulateSubscription() {
    cy.intercept('GET', '**/api/v4/cloud/subscription', {
        statusCode: 200,
        body: {
            id: 'sub_test1',
            is_free_trial: 'true',
            customer_id: '5zqhakmibpgyix9juiwwkpfnmr',
            product_id: 'prod_LSBESgGXq9KlLj',
            seats: 25,
            status: 'active',
        },
    });

    cy.intercept('GET', '**/api/v4/cloud/products**', {
        statusCode: 200,
        body:
        [
            {
                id: 'prod_LSBESgGXq9KlLj',
                sku: 'cloud-starter',
                price_per_seat: 0,
                name: 'Cloud Free',
                recurring_interval: 'month',
                cross_sells_to: '',
            },
            {
                id: 'prod_K0AxuWCDoDD9Qq',
                sku: 'cloud-professional',
                price_per_seat: 10,
                name: 'Cloud Professional',
                recurring_interval: 'month',
                cross_sells_to: 'prod_MYrZ0xObCXOyVr',
            },
            {
                id: 'prod_Jh6tBLcgWWOOog',
                sku: 'cloud-enterprise',
                price_per_seat: 30,
                name: 'Cloud Enterprise',
                recurring_interval: 'month',
                cross_sells_to: '',
            },
            {
                id: 'prod_MYrZ0xObCXOyVr',
                sku: 'cloud-professional',
                price_per_seat: 96,
                recurring_interval: 'year',
                name: 'Cloud Professional Yearly',
                cross_sells_to: 'prod_K0AxuWCDoDD9Qq',
            },
        ],
    });
}

describe('System Console - Subscriptions section', () => {
    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');
    });

    beforeEach(() => {
        simulateSubscription();

        // # Visit Subscription page
        cy.visit('/admin_console/billing/subscription');
    });

    it('MM-T5127 User can switch between Yearly and Monthly Subscription in Purchase modal', () => {
        const professionalMonthlySubscription = {
            id: 'prod_K0AxuWCDoDD9Qq',
            sku: 'cloud-professional',
            price_per_seat: 10,
            name: 'Cloud Professional',
            recurring_interval: 'month',
            cross_sells_to: 'prod_MYrZ0xObCXOyVr',
        };
        const professionalYearlySubscription = {
            id: 'prod_MYrZ0xObCXOyVr',
            sku: 'cloud-professional',
            price_per_seat: 96,
            recurring_interval: 'year',
            name: 'Cloud Professional Yearly',
            cross_sells_to: 'prod_K0AxuWCDoDD9Qq',
        };

        // * Check for User count
        cy.request('/api/v4/analytics/old?name=standard&team_id=').then((response) => {
            cy.get('.PlanDetails__userCount > span').invoke('text').then((text) => {
                const userCount = response.body.find((obj) => obj.name === 'unique_user_count');
                expect(text).to.contain(userCount.value);
                const count = userCount.value;

                // # Click on Upgrade Now button
                cy.contains('span', 'Upgrade Now').parent().click();

                // # Click on Upgrade Now button on plans modal
                cy.get('#professional_action').click();

                // * Check for "Provide Your Payment Details" label
                cy.findByText('Provide your payment details').should('be.visible');

                // * check that the toggle exists and that its initial state is monthly
                cy.get('.RHS').get('#text-selected').contains('Monthly');
                cy.get('.RHS').get('#text-unselected').contains('Yearly');
                cy.get('.RHS').get('.plan_price_rate_section').contains(professionalMonthlySubscription.price_per_seat);

                // # click on the "Yearly" label
                cy.get('.RHS').get('#text-unselected').click();

                // * check that the "yearly" label is selected and the price matches the yearly product's price
                cy.get('.RHS').get('#text-unselected').contains('Monthly');
                cy.get('.RHS').get('#text-selected').contains('Yearly');
                cy.get('.RHS').get('.plan_price_rate_section').contains(professionalYearlySubscription.price_per_seat / 12);
                cy.get('.RHS').get('#input_UserSeats').should('have.value', count);

                // * check that the "save with yearly" text exists
                cy.get('.RHS').get('.save_text').contains('Save 20% with Yearly!');

                // # click on the "Monthly" label
                cy.get('.RHS').get('#text-unselected').click();

                // * check that the "monthly" label is selected and the price matches the monthly product's price
                cy.get('.RHS').get('#text-selected').contains('Monthly');
                cy.get('.RHS').get('#text-unselected').contains('Yearly');
                cy.get('.RHS').get('.plan_price_rate_section').contains(professionalMonthlySubscription.price_per_seat);
            });
        });
    });

    it('MM-T5128 Updating the Usercount input field updates the prices accordingly in the Purchase modal', () => {
        const professionalMonthlySubscription = {
            id: 'prod_K0AxuWCDoDD9Qq',
            sku: 'cloud-professional',
            price_per_seat: 10,
            name: 'Cloud Professional',
            recurring_interval: 'month',
            cross_sells_to: 'prod_MYrZ0xObCXOyVr',
        };
        const professionalYearlySubscription = {
            id: 'prod_MYrZ0xObCXOyVr',
            sku: 'cloud-professional',
            price_per_seat: 96,
            recurring_interval: 'year',
            name: 'Cloud Professional Yearly',
            cross_sells_to: 'prod_K0AxuWCDoDD9Qq',
        };

        // * Check for User count
        cy.request('/api/v4/analytics/old?name=standard&team_id=').then((response) => {
            cy.get('.PlanDetails__userCount > span').invoke('text').then((text) => {
                const userCount = response.body.find((obj) => obj.name === 'unique_user_count');
                expect(text).to.contain(userCount.value);

                const count = Number(userCount.value);

                const numMonths = 12;

                const checkValues = (currentCount) => {
                    cy.get('.RHS').get('.monthly_price').contains(currentCount * professionalMonthlySubscription.price_per_seat * numMonths);
                    cy.get('.RHS').get('.yearly_savings').contains(currentCount * (professionalMonthlySubscription.price_per_seat - (professionalYearlySubscription.price_per_seat / numMonths)) * numMonths);
                    cy.get('.RHS').get('.total_price').contains(currentCount * professionalYearlySubscription.price_per_seat);
                };

                // # Click on Upgrade Now button
                cy.contains('span', 'Upgrade Now').parent().click();

                // # Click on Upgrade Now button on plans modal
                cy.get('#professional_action').click();

                // * Check for "Provide Your Payment Details" label
                cy.findByText('Provide your payment details').should('be.visible');

                // # click on the "Yearly" label
                cy.get('.RHS').get('#text-unselected').click();

                // * check that the "yearly" label is selected and the price matches the yearly product's price
                cy.get('.RHS').get('#text-unselected').contains('Monthly');
                cy.get('.RHS').get('#text-selected').contains('Yearly');
                cy.get('.RHS').get('.plan_price_rate_section').contains(professionalYearlySubscription.price_per_seat / 12);
                cy.get('.RHS').get('#input_UserSeats').should('have.value', count);

                // * check that the yearly, monthly, and saving prices are correct
                checkValues(count);

                // # Enter card details and user details
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

                // # Change the user seats field to a value smaller than the current number of users
                const lessThanUserCount = count - 5;
                cy.get('#input_UserSeats').clear().type(lessThanUserCount);

                // * Ensure that the yearly, monthly, and yearly saving prices match the new user seats value entered
                checkValues(lessThanUserCount);
                cy.get('.RHS').get('.Input___customMessage').contains(`Your workspace currently has ${count} users`);

                // * Check that Upgrade button is not enabled
                cy.get('.RHS').find('button').should('be.disabled');

                // # Change the user seats field to a value bigger than the current number of users
                const greaterThanUserCount = count + 5;
                cy.get('#input_UserSeats').clear().type(greaterThanUserCount);

                // * Ensure that the yearly, monthly, and yearly saving prices match the new user seats value entered
                checkValues(greaterThanUserCount);

                // * Check for enable status of Upgrade button
                cy.get('.RHS').find('button').should('be.enabled');
            });
        });
    });
});
