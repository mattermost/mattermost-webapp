// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise

describe('Billing', () => {
    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');

        // # Disable LDAP
        cy.apiUpdateConfig({LdapSettings: {Enable: false}});

        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });

        gotoSubscriptionScreen();
    });

    beforeEach(() => cy.visit('/admin_console/billing/subscription'));

    it('MM-37054 - Trail tag on Subscription screen', () => {
        // * Check for Trail tag
        cy.contains('span', 'Trial').should('be.visible');
    });

    it('MM-37054 - Contact Sales navigation from Subscription screen', () => {
        // * Check for Contact Sales navigation
        cy.contains('span', 'Contact Sales').parent().then((link) => {
            const getHref = () => link.prop('href');
            cy.wrap({href: getHref}).invoke('href').should('contains', '/contact-us');
            cy.wrap(link).should('have.attr', 'target', '_blank');
            cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
            cy.request(link.prop('href')).its('status').should('eq', 200);
        });
    });

    it('MM-37054 - "See how billing works" navigation from Subscription screen', () => {
        // * Check for See how billing works navigation
        cy.contains('span', 'See how billing works').parent().then((link) => {
            const getHref = () => link.prop('href');
            cy.wrap({href: getHref}).invoke('href').should('contains', '/cloud-billing.html');
            cy.wrap(link).should('have.attr', 'target', '_new');
            cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
            cy.request(link.prop('href')).its('status').should('eq', 200);
        });
    });

    it('MM-37054 - "Subscribe now" navigation and closing of Subscribe window', () => {
        // # Click on Subscribe Now button
        cy.contains('span', 'Subscribe Now').parent().click();

        // * Check for "Provide Your Payment Details" label
        cy.get('.title').contains('span', 'Provide Your Payment Details').should('be.visible');

        // # Click on close button of subscribe window
        cy.get('#closeIcon').parent().should('exist').click();

        // * Check for "You're currently on a free trial" label
        cy.contains('span', "You're currently on a free trial").should('be.visible');
    });

    it('MM-37054 - "Company Plans" navigation from Subscribe window', () => {
        // # Click on Subscribe Now button
        cy.contains('span', 'Subscribe Now').parent().click();

        // * Check for "Provide Your Payment Details" label
        cy.get('.title').contains('span', 'Provide Your Payment Details').should('be.visible');

        // * Check for See how billing works navigation
        cy.contains('span', 'Compare plans').parent().then((link) => {
            const getHref = () => link.prop('href');
            cy.wrap({href: getHref}).invoke('href').should('contains', '/pricing-cloud');
            cy.wrap(link).should('have.attr', 'target', '_blank');
            cy.wrap(link).should('have.attr', 'rel', 'noreferrer');
            cy.request(link.prop('href')).its('status').should('eq', 200);
        });
    });

    it('MM-37054 - "See how billing works" navigation from Subscribe screen', () => {
        // # Click on Subscribe Now button
        cy.contains('span', 'Subscribe Now').parent().click();

        // * Check for "Provide Your Payment Details" label
        cy.get('.title').contains('span', 'Provide Your Payment Details').should('be.visible');

        // * Check for See how billing works navigation
        cy.contains('span', 'See how billing works').parent().then((link) => {
            const getHref = () => link.prop('href');
            cy.wrap({href: getHref}).invoke('href').should('contains', '/cloud-billing.html');
            cy.wrap(link).should('have.attr', 'target', '_new');
            cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
            cy.request(link.prop('href')).its('status').should('eq', 200);
        });
    });

    it('MM-37054 - "Contact Support" navigation from Subscription screen', () => {
        // # Click on Subscribe Now button
        cy.contains('span', 'Subscribe Now').parent().click();

        // * Check for "Provide Your Payment Details" label
        cy.get('.title').contains('span', 'Provide Your Payment Details').should('be.visible');

        // * Check for Contact Support navigation
        cy.contains('span', 'Contact Support').parent().then((link) => {
            const getHref = () => link.prop('href');
            cy.wrap({href: getHref}).invoke('href').should('contains', '/contact-us');
            cy.wrap(link).should('have.attr', 'target', '_new');
            cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
            cy.request(link.prop('href')).its('status').should('eq', 200);
        });
    });

    it('MM-37054 - "Contact Sales" navigation from Subscribe screen', () => {
        // # Click on Subscribe Now button
        cy.contains('span', 'Subscribe Now').parent().click();

        // * Check for "Provide Your Payment Details" label
        cy.get('.title').contains('span', 'Provide Your Payment Details').should('be.visible');

        // * Check for Contact Sales navigation
        cy.contains('span', 'Contact Sales').parent().then((link) => {
            const getHref = () => link.prop('href');
            cy.wrap({href: getHref}).invoke('href').should('contains', '/contact-us');
            cy.wrap(link).should('have.attr', 'target', '_new');
            cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
            cy.request(link.prop('href')).its('status').should('eq', 200);
        });
    });

    it('MM-37054 - Enabling of "Subscribe" button in Subscribe window', () => {
        // # Click on Subscribe Now button
        cy.contains('span', 'Subscribe Now').parent().click();

        // * Check for "Provide Your Payment Details" label
        cy.get('.title').contains('span', 'Provide Your Payment Details').should('be.visible');

        // # Enter card details
        getIframeBody().find('[name="cardnumber"]').clear().type('4242424242424242');
        getIframeBody().find('[name="exp-date"]').clear().type('4242');
        getIframeBody().find('[name="cvc"]').clear().type('412');
        cy.get('#input_name').clear().type('test name');
        cy.contains('legend', 'Country').parent().find('.icon-chevron-down').click();
        cy.contains('legend', 'Country').parent().find("input[type='text']").type('India{enter}');
        cy.get('#input_address').type('test1');
        cy.get('#input_address2').type('test2');
        cy.get('#input_city').clear().type('testcity');
        cy.get('#input_state').type('test');
        cy.get('#input_postalCode').type('444');

        // * Check for enable status of Subscribe button
        cy.get('.RHS').find('button').should('be.enabled');
    });

    it('MM-37054 - Disabling of Subscribe button for not having valid data in Manditory fields in Subscribe screen', () => {
        // # Click on Subscribe Now button
        cy.contains('span', 'Subscribe Now').parent().click();

        // # Enter card details
        getIframeBody().find('[name="cardnumber"]').clear().type('4242424242424242');
        getIframeBody().find('[name="exp-date"]').clear().type('4242');
        getIframeBody().find('[name="cvc"]').clear().type('412');
        cy.get('#input_name').clear().type('test name');
        cy.contains('legend', 'Country').parent().find('.icon-chevron-down').click();
        cy.contains('legend', 'Country').parent().find("input[type='text']").type('India{enter}');
        cy.get('#input_address').type('test1');
        cy.get('#input_address2').type('test2');
        cy.get('#input_city').clear().type('testcity');
        cy.get('#input_state').type('test');
        cy.get('#input_postalCode').type('444');

        // * Check for enable status of Subscribe button
        cy.get('.RHS').find('button').should('be.enabled');

        // # Enter invalid csv
        getIframeBody().find('[name="cvc"]').clear().type('12');
        cy.get('#input_name').clear().type('test user');
        cy.get('.RHS').find('button').should('be.disabled');

        // # Enter billing details
        cy.contains('legend', 'Country').parent().find('.icon-chevron-down').click();
        cy.contains('legend', 'Country').parent().find("input[type='text']").type('India{enter}');
        cy.get('.RHS').find('button').should('be.disabled');
        cy.get('#input_address').type('test1');
        cy.get('#input_address2').type('test2');
        cy.get('#input_city').clear().type('testcity');
        cy.get('.RHS').find('button').should('be.disabled');
        cy.get('#input_state').type('test');
        cy.get('.RHS').find('button').should('be.disabled');
        cy.get('#input_postalCode').type('444');

        //Disable upgrade button when we enter wrong card details
        getIframeBody().find('[name="cardnumber"]').clear().type('4242424242424141');
        getIframeBody().find('[name="exp-date"]').clear().type('4242');
        getIframeBody().find('[name="cvc"]').clear().type('472');
        cy.get('#input_name').clear().type('test user');
        cy.get('.RHS').find('button').should('be.disabled');
    });
});

const getIframeBody = () => {
    // # Get the body of iframe element
    return cy.
        get('.__PrivateStripeElement > iframe').
        its('0.contentDocument.body').should('not.be.empty').
        then(cy.wrap);
};

const gotoSubscriptionScreen = () => {
    // # navigating to Subscription Screen
    cy.get('.sidebar-header-dropdown__icon').click();
    cy.findByText('System Console').should('be.visible').click();
    cy.findByText('Subscription').should('be.visible').click();
};

