// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// e.g. not_cloud cloud because we always want to exclude running automatically
// until we create the special self-hosted run setup
// Stage: @prod
// Group: @enterprise @not_cloud @cloud

import * as TIMEOUTS from '../../../fixtures/timeouts';

function verifyPurchaseModal() {
    cy.contains('Provide your payment details');
    cy.contains('Contact Sales');
    cy.contains('Contact Sales');
    cy.contains('Compare plans');
    cy.contains('Credit Card');
    cy.contains('Billing address');
    cy.contains('Enterprise Edition Subscription Terms');
    cy.contains('You will be billed today.');
}

interface PurchaseForm {
    card: string;
    expires: string;
    cvc: string;
    org: string;
    name: string;
    country: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    agree: boolean;

}
const successCardNumber = '4242424242424242';
const defaultSuccessForm: PurchaseForm = {
    card: successCardNumber,
    expires: '424', // e.g. 4/24
    cvc: '242',
    org: 'My org',
    name: 'The Cardholder',
    country: 'United States of America',
    address: '123 Main Street',
    city: 'Minneapolis',
    state: 'Minnesota',
    zip: '55423',
    agree: true,
};

function changeByPlaceholder(placeholder: string, value: string) {
    cy.findByPlaceholderText(placeholder).type(value);
}
function selectDropdownValue(placeholder: string, value: string) {
    cy.contains(placeholder).click();
    cy.contains(value).click();
}

function fillForm(form: PurchaseForm) {
    cy.uiGetPaymentCardInput().within(() => {
        cy.get('[name="cardnumber"]').should('be.enabled').clear().type(form.card);
        cy.get('[name="exp-date"]').should('be.enabled').clear().type(form.expires);
        cy.get('[name="cvc"]').should('be.enabled').clear().type(form.cvc);
    });

    changeByPlaceholder('Organization Name', form.org);

    changeByPlaceholder('Name on Card', form.name);
    selectDropdownValue('Country', form.country);
    changeByPlaceholder('Address', form.address);
    changeByPlaceholder('City', form.city);
    selectDropdownValue('State/Province', form.state);
    changeByPlaceholder('Zip/Postal Code', form.zip);
    if (form.agree) {
        cy.get('#self_hosted_purchase_terms').click();
    }

    // not changing the license seats number,
    // because it is expected to be pre-filled with the correct number of seats.

    const upgradeButton = cy.contains('Upgrade');

    // while this will not work if the caller passes in an object
    // that has member equality but not reference equality, this is
    // good enough for the limited usage this function has
    if (form === defaultSuccessForm) {
        upgradeButton.should('be.enabled');
    }

    return upgradeButton;
}

function assertLine(lines: string[], key: string, value: string) {
    const line = lines.find((line) => line.includes(key));
    if (!line) {
        throw new Error('Expected license to show start date line but did not');
    }
    if (!line.includes(value)) {
        throw new Error(`Expected license ${key} of ${value}, but got ${line}`);
    }
}

describe('Self hosted Purchase', () => {
    let adminUser: Cypress.UserProfile | undefined;

    before(() => {
        cy.apiAdminLogin().then((result) => {
            // assertion because current typings are wrong.
            adminUser = (result as any).user;
            cy.apiDeleteLicense();
            cy.visit('/');
        });
    });

    it('happy path, can purchase a license and have it applied automatically', () => {
        cy.intercept('GET', '**/api/v4/analytics/old?name=standard&team_id=').as('analytics');

        cy.apiAdminLogin();

        // TODO: Double check if fetching analytics is still flaky.
        const analytics = cy.wait('@analytics');

        cy.intercept('GET', '**/api/v4/hosted_customer/signup_available').as('airGappedCheck');
        cy.intercept('GET', 'https://js.stripe.com/v3').as('stripeCheck');
        cy.intercept('GET', '**/api/v4/cloud/products/selfhosted').as('products');

        // # Open pricing modal
        cy.get('#UpgradeButton').should('exist').click();

        cy.wait('@airGappedCheck');
        cy.wait('@stripeCheck');

        const products = cy.wait('@products');
        const professionalProduct = products.then((res) => {
            const professionalProduct = res.response.body.find((product: Cypress.Product) => product.sku === 'professional');
            return cy.wrap(professionalProduct);
        });
        const currentUsers = analytics.then((res) => {
            const usersRecord = res.response.body.find((row: Cypress.AnalyticsRow) => row.name === 'unique_user_count');
            return cy.wrap(usersRecord.value);
        });

        // cy.get('#professional_action1234fail')

        // The waits for these fetches is usually enough. Add a little wait
        // for all the selectors to be updated and rerenders to happen
        // so that we do not accidentally hit the air-gapped modal
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(50);

        // # Click the upgrade button to open the modal
        cy.get('#professional_action').should('exist').click();

        // * Verify basic purchase elements are available
        verifyPurchaseModal();

        // * Verify basic purchase elements are available
        fillForm(defaultSuccessForm);

        // # Wait explicitly for purchase to occur because it takes so long.
        cy.intercept('POST', '**/api/v4/hosted_customer/customer').as('createCustomer');
        cy.intercept('POST', '**/api/v4/hosted_customer/confirm').as('purchaseLicense');

        cy.contains('Upgrade').click();

        cy.wait('@createCustomer');

        // The purchase endpoint is a long once. The server itself waits two minutes.
        // Waiting a little longer ensures we don't give up on the server when it
        // succeeds (albeit slowly)
        cy.wait('@purchaseLicense', {responseTimeout: TIMEOUTS.TWO_MIN + TIMEOUTS.ONE_HUNDRED_MILLIS});

        cy.contains('Your Professional license has now been applied.');

        cy.contains('Close').click();

        const today = new Date().toLocaleString().split(/\D/).slice(0, 3).join('/');
        const expiresDate = new Date(Date.now() + (366 * 24 * 60 * 60 * 1000)).toLocaleString().split(/\D/).slice(0, 3).join('/');
        const todayPadded = new Date().toLocaleString().split(/\D/).slice(0, 3).map((num) => num.padStart(2, '0')).join('/');

        cy.visit('/admin_console/about/license');

        // * Verify information on the new purchased license

        cy.contains('Edition and License');
        cy.contains('Mattermost Professional');

        const enterpriseCard = cy.findByTestId('EnterpriseEditionLeftPanel');

        // get licensed users

        // need to waid for all data to load in, so you don't get flaky
        // asserts over still not filled in items
        cy.wait(TIMEOUTS.ONE_SEC);
        const licenseElements = enterpriseCard.get('.item-element').then(($els) => Cypress._.map($els, 'innerText'));
        licenseElements.then((lines) => {
            assertLine(lines, 'START DATE', today);
            assertLine(lines, 'EXPIRES', expiresDate);

            currentUsers.then((userCount) => {
                assertLine(lines, 'USERS', userCount.toString());
                assertLine(lines, 'ACTIVE USERS', userCount.toString());
            });
            assertLine(lines, 'EDITION', 'Mattermost Professional');
            assertLine(lines, 'ISSUED', today);

            assertLine(lines, 'NAME', adminUser.first_name + ' ' + adminUser.last_name);
            assertLine(lines, 'COMPANY / ORG', defaultSuccessForm.org);
        });

        // # Visit invoices page
        cy.visit('/admin_console/billing/billing_history');

        // * Ensure we are not redirected
        cy.contains('Billing History');

        // * Ensure summary values are correct
        cy.contains(todayPadded);
        cy.contains('Self-Hosted Professional');

        // eslint-disable-next-line new-cap
        const dollarUSLocale = Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2});

        currentUsers.then((userCount) => {
            cy.contains(`${userCount} users`);

            professionalProduct.then((product) => {
                const purchaseAmount = dollarUSLocale.format(userCount as unknown as number * (product as unknown as Cypress.Product).price_per_seat * 12);
                cy.contains(purchaseAmount);
            });
        });
        cy.contains('Paid');
    });
});
