// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @cloud_only @cloud_trial
// Skip:  @headless @electron // run on Chrome (headed) only

import dayJs from 'dayjs';

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import billing from '../../../../fixtures/client_billing.json';

describe('System Console - Payment Information section', () => {
    const currentDate = new Date();

    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');

        // # Visit Subscription page
        cy.visit('/admin_console/billing/subscription');

        // * Check for Subscription header
        cy.contains('.admin-console__header', 'Subscription').should('be.visible');

        // # Click Subscribe Now button
        cy.contains('span', 'Subscribe Now').parent().click();

        cy.intercept('POST', '/api/v4/cloud/payment/confirm').as('confirm');

        cy.intercept('GET', '/api/v4/cloud/subscription').as('subscribe');

        // # Enter card details
        cy.uiGetPaymentCardInput().within(() => {
            cy.get('[name="cardnumber"]').should('be.enabled').clear().type(billing.visa.cardNumber);
            cy.get('[name="exp-date"]').should('be.enabled').clear().type(billing.visa.expDate);
            cy.get('[name="cvc"]').should('be.enabled').clear().type(billing.visa.cvc);
        });
        cy.get('#input_name').clear().type('test name');
        cy.findByText('Country').parent().find('.icon-chevron-down').click();
        cy.findByText('Country').parent().find("input[type='text']").type('India{enter}');
        cy.get('#input_address').clear().type('testaddress');
        cy.get('#input_city').clear().type('testcity');
        cy.get('#input_state').clear().type('teststate');
        cy.get('#input_postalCode').clear().type('4444');

        // # Click Subscribe button
        cy.get('.RHS').find('button').should('be.enabled').click();

        cy.wait(['@confirm', '@subscribe']);

        // * Check for success message
        cy.findByText('Great! You\'re now upgraded', {timeout: TIMEOUTS.TEN_SEC}).should('be.visible');

        // * Check for starting date of the paid plan
        cy.findByText(`Starting ${dayJs(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)).format('MMM D, YYYY')} you will be charged based on the number of enabled users`).should('exist');

        // # Click Let's go! button
        cy.get('#payment_complete_header').find('button').should('be.enabled').click();
    });

    it('MM-T4167 check for the card details in payment info screen', () => {
        navigateToPaymentInfoScreen();

        // * Check for last four digit of card and Expire date
        cy.get('.PaymentInfoDisplay__paymentInfo-cardInfo').within(() => {
            cy.get('span').eq(0).should('have.text', 'visa ending in 4242');
            cy.get('span').eq(1).should('have.text', 'Expires 04/2024');
        });

        // * Check for address details
        cy.get('.PaymentInfoDisplay__paymentInfo-address').within(() => {
            cy.get('div').eq(0).should('have.text', 'testaddress');
            cy.get('div').eq(1).should('have.text', 'testcity, teststate, 4444');
            cy.get('div').eq(2).should('have.text', 'IO');
        });
    });

    it('MM-T4169 Check for see billing link navigation in edit payment info', () => {
        navigateToPaymentInfoScreen();

        // # Click edit button
        cy.get('.PaymentInfoDisplay__paymentInfo-editButton').click();

        // * Check for See how billing works navigation
        cy.contains('span', 'See how billing works').parent().then((link) => {
            const getHref = () => link.prop('href');
            cy.wrap({href: getHref}).invoke('href').should('contains', '/cloud-billing.html');
            cy.wrap(link).should('have.attr', 'target', '_new');
            cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
            cy.request(link.prop('href')).its('status').should('eq', 200);
        });
    });

    it('MM-T4170 Edit payment info', () => {
        navigateToPaymentInfoScreen();

        cy.intercept('GET', '/api/v4/cloud/customer').as('customer');

        // # Click edit button
        cy.get('.PaymentInfoDisplay__paymentInfo-editButton').click();

        cy.wait('@customer');

        cy.intercept('POST', '/api/v4/cloud/payment').as('payment');

        cy.intercept('POST', '/api/v4/cloud/payment/confirm').as('confirm');

        cy.intercept('GET', '/api/v4/cloud/subscription').as('subscribe');

        // # Enter card details
        cy.uiGetPaymentCardInput().within(() => {
            cy.get('[name="cardnumber"]').should('be.enabled').clear().type(billing.mastercard.cardNumber);
            cy.get('[name="exp-date"]').should('be.enabled').clear().type(billing.mastercard.expDate);
            cy.get('[name="cvc"]').clear().should('be.enabled').type(billing.mastercard.cvc);
        });
        cy.get('#input_name').clear().type('test newname');
        cy.findByText('Country').parent().find('.icon-chevron-down').click();
        cy.findByText('Country').parent().find("input[type='text']").type('Algeria{enter}');
        cy.get('#input_address').clear().type('testnewaddress');
        cy.get('#input_city').clear().type('testnewcity');
        cy.get('#input_state').clear().type('testnewstate');
        cy.get('#input_postalCode').clear().type('3333');

        // # Click Save Credit Card button
        cy.get('#saveSetting').should('be.enabled').click();

        cy.wait(['@payment', '@confirm']);

        cy.wait('@subscribe');

        // * Check for last four digit of card and Expire date
        cy.get('.PaymentInfoDisplay__paymentInfo-cardInfo').within(() => {
            cy.get('span').eq(0).should('have.text', 'mastercard ending in 4444');
            cy.get('span').eq(1).should('have.text', 'Expires 04/2024');
        });

        // * Check for address details
        cy.get('.PaymentInfoDisplay__paymentInfo-address').within(() => {
            cy.get('div').eq(0).should('have.text', 'testnewaddress');
            cy.get('div').eq(1).should('have.text', 'testnewcity, testnewstate, 3333');
            cy.get('div').eq(2).should('have.text', 'DZ');
        });
    });

    it('MM-T4171 disable Save Credit Card button in edit payment info', () => {
        navigateToPaymentInfoScreen();

        cy.intercept('GET', '/api/v4/cloud/customer').as('customer');

        // # Click edit button
        cy.get('.PaymentInfoDisplay__paymentInfo-editButton').click();

        cy.wait('@customer');

        // # Enter card details
        cy.uiGetPaymentCardInput().within(() => {
            cy.get('[name="cardnumber"]').should('be.enabled').clear().type(billing.mastercard.cardNumber);
            cy.get('[name="exp-date"]').should('be.enabled').clear().type(billing.mastercard.expDate);
            cy.get('[name="cvc"]').clear().should('be.enabled').type(billing.mastercard.cvc);
        });
        cy.get('#input_name').should('be.enabled').invoke('val', '');
        cy.findByText('Country').parent().find('.icon-chevron-down').click();
        cy.findByText('Country').parent().find("input[type='text']").should('be.enabled').type('Algeria{enter}');
        cy.get('#input_address').should('be.enabled').invoke('val', '');
        cy.get('#input_city').should('be.enabled').invoke('val', '');
        cy.get('#input_state').should('be.enabled').clear().type('testnewstate');
        cy.get('#input_postalCode').should('be.enabled').clear().type('3333');

        // * Check for disabling of Save Credit Card button
        cy.get('#saveSetting').should('not.be.enabled');

        cy.get('#input_name').should('be.enabled').clear().type('test newname');
        cy.get('#input_address').should('be.enabled').clear().type('testnewaddress');
        cy.get('#input_address').should('be.enabled').clear().type('testcity');

        // * Check for enabling of Save Credit Card button
        cy.get('#saveSetting').should('be.enabled');
    });

    it('MM-T4172 Cancelling the edit payment info', () => {
        navigateToPaymentInfoScreen();

        // # Click edit button
        cy.get('.PaymentInfoDisplay__paymentInfo-editButton').click();

        // # Click edit button
        cy.get(' .admin-console__header .back').click();

        // * Check for Payment info header
        cy.contains('.admin-console__header', 'Payment Information').should('be.visible');

        // # Click edit button
        cy.get('.PaymentInfoDisplay__paymentInfo-editButton').click();

        // # Enter card details
        cy.uiGetPaymentCardInput().within(() => {
            cy.get('[name="cardnumber"]').should('be.enabled').clear().type(billing.unionpay.cardNumber);
            cy.get('[name="exp-date"]').should('be.enabled').clear().type(billing.unionpay.expDate);
            cy.get('[name="cvc"]').should('be.enabled').clear().type(billing.unionpay.cvc);
        });
        cy.get('#input_name').clear().type('test newname');
        cy.findByText('Country').parent().find('.icon-chevron-down').click();
        cy.findByText('Country').parent().find("input[type='text']").type('Albania{enter}');
        cy.get('#input_address').clear().type('testcanceladdress');
        cy.get('#input_city').clear().type('testcancelcity');
        cy.get('#input_state').clear().type('testcanceltate');
        cy.get('#input_postalCode').clear().type('2222');

        // # Click Cancel button
        cy.get('.cancel-button').click();

        // * Check for last four digit of card and Expire date
        cy.get('.PaymentInfoDisplay__paymentInfo-cardInfo').within(() => {
            cy.get('span').eq(0).should('not.have.text', 'unionpay ending in 0005');
            cy.get('span').eq(1).should('not.have.text', 'Expires 12/2012');
        });

        // * Check for address details
        cy.get('.PaymentInfoDisplay__paymentInfo-address').within(() => {
            cy.get('div').eq(0).should('not.have.text', 'testcanceladdress');
            cy.get('div').eq(1).should('not.have.text', 'testcancelcity, testcanceltate, 2222');
            cy.get('div').eq(2).should('not.have.text', 'AL');
        });
    });
});

// # navigate to payment information screen
const navigateToPaymentInfoScreen = () => {
    cy.get('#billing\\/payment_info').should('be.visible').click();
    cy.contains('.admin-console__header', 'Payment Information').should('be.visible');
};
