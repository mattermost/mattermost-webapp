// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @cloud_only

describe('System Console - Subscriptions section', () => {
    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');

        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });

        // # Capture the Subscribe Now button from Banner
        cy.contains('span', 'Subscribe Now').parent().as('SubscribeBtn');

        cy.intercept('**/api/v4/cloud/subscription').as('forNonExistanceOfTrailTag');
        gotoSubscriptionScreen();
    });

    beforeEach(() => {
        cy.intercept('**/api/v4/cloud/subscription').as('forVisibilityOfTrailTag');
        cy.visit('/admin_console/billing/subscription');
    });

    it('MM-37054 - Navigation of Subscribe button of Banner to Subscription screen', () => {
        // * Check for navigation of Subscribe button of Banner
        cy.get('@SubscribeBtn').then((ele) => {
            cy.wrap(ele).click();

            // * Check for "Provide Your Payment Details" label
            cy.get('.title').contains('span', 'Provide Your Payment Details').should('be.visible');
        });
    });

    it('MM-37054 - Non Existance of Trail tag on Subscription screen', () => {
        // * Check for non existance of Trail tag
        cy.wait('@forNonExistanceOfTrailTag').then((resObj) => {
            expect(resObj.response.statusCode).to.equal(200);
            const modifiedRes = {...resObj.response.body, ...resObj.response.body.is_free_trial = 'false'};
            cy.intercept('**/api/v4/cloud/subscription', modifiedRes).as('nonExistanceTrailTag');
            cy.contains('span', 'Trial').should('not.exist');
            cy.wait('@nonExistanceTrailTag', {timeout: 5000}).then((xhr) => expect(xhr.response.statusCode).to.equal(200));
        });
    });

    it('MM-37054 - Visibility of Trail tag on Subscription screen', () => {
        // * Check for visibility of Trail tag
        cy.wait('@forVisibilityOfTrailTag').then((res) => {
            expect(res.response.statusCode).to.equal(200);
            const modifiedRes = {...res.response.body, ...res.response.body.is_free_trial = 'true'};
            cy.intercept('**/api/v4/cloud/subscription', modifiedRes).as('visibleTrailTag');
            cy.contains('span', 'Trial').should('be.visible');
            cy.wait('@visibleTrailTag', {timeout: 5000}).then((xhr) => expect(xhr.response.statusCode).to.equal(200));
        });
    });

    it('MM-37054 - User Count on Subscription screen', () => {
        // * Check for User count
        cy.request('/api/v4/analytics/old?name=standard&team_id=').then((response) => {
            cy.get('.PlanDetails__userCount > span').invoke('text').then((text) => {
                const userCount = response.body.find((obj) => obj.name === 'unique_user_count');
                expect(text).to.contain(userCount.value);
            });
        });
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

    it('MM-37054 - "Contact Support" navigation from Subscribe screen', () => {
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

    it('MM-37054 - Enabling of "Subscribe" button and Subscribing a plan from Subscribe window', () => {
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

        // # Click on Subscribe button
        cy.get('.RHS').find('button').should('be.enabled').click();

        // * Click on successfull message
        cy.contains('span', "Great! You're now upgraded").should('be.visible');

        // # Click on Let's Go button
        cy.contains('Lets go!').parent.click();

        // * Check for non existance of Trail tag
        cy.contains('span', 'Trial').should('not.exist');
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

