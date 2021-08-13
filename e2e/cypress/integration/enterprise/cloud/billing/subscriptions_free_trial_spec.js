// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @cloud_only @cloud_trial
// Skip:  @headless @electron // run on Chrome (headed) only

describe('System Console - Subscriptions section', () => {
    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');

        // # Visit Subscription page
        cy.visit('/admin_console/billing/subscription');

        // * Check for Subscription header
        cy.get('.admin-console__header').should('be.visible').and('have.text', 'Subscriptions');
    });

    beforeEach(() => {
        // # Click on close button of subscribe window if exist
        cy.get('body').then(($body) => {
            if ($body.find('#closeIcon').length > 0) {
                cy.get('#closeIcon').parent().click();
            }
        });
    });

    it('MM-T4118 Visibility of Trial tag on Subscription screen', () => {
        // * Check for visibility of Trial tag
        cy.contains('span', 'Trial', {timeout: 10000}).should('be.visible');
    });

    it('MM-T4119 User Count on Subscription screen', () => {
        // * Check for User count
        cy.request('/api/v4/analytics/old?name=standard&team_id=').then((response) => {
            cy.get('.PlanDetails__userCount > span').invoke('text').then((text) => {
                const userCount = response.body.find((obj) => obj.name === 'unique_user_count');
                expect(text).to.contain(userCount.value);
            });
        });
    });

    it('MM-T4126 "Contact Sales" navigation from Subscription screen', () => {
        // * Check for Contact Sales navigation
        cy.apiGetMe().then(({user}) => {
            const adminUser = user;
            const email = encodeURIComponent(adminUser.email);
            const name = encodeURIComponent(`${adminUser.first_name} ${adminUser.last_name}`);
            cy.contains('span', 'Contact Sales').parent().then((link) => {
                const getHref = () => link.prop('href');
                cy.wrap({href: getHref}).invoke('href').should('contains', `/contact-us?email=${email}&name=${name}&inquiry=sales&inquiry-issue=trial_questions`);
                cy.wrap(link).should('have.attr', 'target', '_blank');
                cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
                cy.request(link.prop('href')).its('status').should('eq', 200);
            });
        });
    });

    it('MM-T4121 "See how billing works" navigation from Subscription screen', () => {
        // * Check for See how billing works navigation
        cy.contains('span', 'See how billing works').parent().then((link) => {
            const getHref = () => link.prop('href');
            cy.wrap({href: getHref}).invoke('href').should('contains', '/cloud-billing.html');
            cy.wrap(link).should('have.attr', 'target', '_new');
            cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
            cy.request(link.prop('href')).its('status').should('eq', 200);
        });
    });

    it('MM-T4122 "Subscribe now" navigation and closing of Subscribe window', () => {
        // # Click on Subscribe Now button
        cy.contains('span', 'Subscribe Now').parent().click();

        // * Check for "Provide Your Payment Details" label
        cy.get('.title').contains('span', 'Provide Your Payment Details').should('be.visible');

        // # Click on close button of subscribe window
        cy.get('#closeIcon').parent().should('exist').click();

        // * Check for "You're currently on a free trial" label
        cy.contains('span', "You're currently on a free trial").should('be.visible');
    });

    it('MM-37054 "Company Plans" navigation from Subscribe window', () => {
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

    it('MM-37054 "See how billing works" navigation from Subscribe window', () => {
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

    it('MM-37054 "Contact Support" navigation from Subscribe window', () => {
        // # Click on Subscribe Now button
        cy.contains('span', 'Subscribe Now').parent().click();

        // * Check for "Provide Your Payment Details" label
        cy.get('.title').contains('span', 'Provide Your Payment Details').should('be.visible');

        // * Check for Contact Support navigation
        cy.apiGetMe().then(({user}) => {
            const adminUser = user;
            const supportemail = encodeURIComponent(adminUser.email);
            const supportname = encodeURIComponent(`${adminUser.first_name} ${adminUser.last_name}`);
            cy.contains('span', 'Contact Support').parent().then((link) => {
                const getHref = () => link.prop('href');
                cy.wrap({href: getHref}).invoke('href').should('contains', `/contact-us?email=${supportemail}&name=${supportname}&inquiry=technical`);
                cy.wrap(link).should('have.attr', 'target', '_new');
                cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
                cy.request(link.prop('href')).its('status').should('eq', 200);
            });
        });
    });

    it('MM-37054 "Contact Sales" navigation from Subscribe window', () => {
        // # Click on Subscribe Now button
        cy.contains('span', 'Subscribe Now').parent().click();

        // * Check for "Provide Your Payment Details" label
        cy.get('.title').contains('span', 'Provide Your Payment Details').should('be.visible');

        // * Check for Contact Sales navigation
        cy.apiGetMe().then(({user}) => {
            const adminUser = user;
            const email = encodeURIComponent(adminUser.email);
            const name = encodeURIComponent(`${adminUser.first_name} ${adminUser.last_name}`);
            cy.contains('span', 'Contact Sales').parent().then((link) => {
                const getHref = () => link.prop('href');
                cy.wrap({href: getHref}).invoke('href').should('contains', `/contact-us?email=${email}&name=${name}&inquiry=sales`);
                cy.wrap(link).should('have.attr', 'target', '_blank');
                cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
                cy.request(link.prop('href')).its('status').should('eq', 200);
            });
        });
    });

    it('MM-T4128 Enabling of "Subscribe" button in Subscribe window', () => {
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

    it('MM-T4129 Disabling of Subscribe button for not having valid data in Mandatory fields in Subscribe screen', () => {
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

        // * Check for disabled Subscribe button for having wrong card details
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

