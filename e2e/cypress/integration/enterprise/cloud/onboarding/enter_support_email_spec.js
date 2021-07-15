// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @onboarding @cloud_only

describe('Cloud Onboarding - Sysadmin enter support email', () => {
    let townSquarePage;
    let sysadmin;

    before(() => {
        cy.apiRequireLicenseForFeature('Cloud');

        cy.apiInitSetup().then(({team}) => {
            townSquarePage = `/${team.name}/channels/town-square`;
        });

        cy.apiAdminLogin().then((res) => {
            sysadmin = res.user;
        });
    });

    beforeEach(() => {
        // # Login as sysadmin and set all steps to false
        const preference = {
            user_id: sysadmin.id,
            category: 'recommended_next_steps',
            value: 'false',
        };
        const adminSteps = [
            'complete_profile',
            'notification_setup',
            'team_setup',
            'invite_members',
            'enter_support_email',
            'hide',
            'skip',
        ];

        cy.apiSaveUserPreference(adminSteps.map((step) => ({...preference, name: step})));
        cy.visit(townSquarePage);
    });

    it('type invalid email address', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Enter support email step
        cy.get('button.NextStepsView__cardHeader:contains(Enter support email)').scrollIntoView().should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .EnterSupportEmailStep').should('be.visible');

        // # Enter email addresses
        cy.get('#input_enter_support_email').should('be.visible').type('robot@').blur();

        // * Check that email validation error shows
        cy.get('.Input___error').should('be.visible').should('contain', 'Please enter a valid email.');
    });

    it('type support email and backend fails', () => {
        // * Stub patching request response to produce an error
        cy.intercept('PUT', '/api/v4/config/patch', {
            statusCode: 400,
            body: {
                error: {details: 'some backend error'},
            },
        });

        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Enter support email step
        cy.get('button.NextStepsView__cardHeader:contains(Enter support email)').scrollIntoView().should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .EnterSupportEmailStep').should('be.visible');

        // # Enter email addresses
        cy.get('#input_enter_support_email').should('be.visible').type('robot@gmail.com');

        // # Click Finish button
        cy.findByTestId('EnterSupportEmailStep__finishButton').should('be.visible').and('not.be.disabled').click();

        // * Check that we show an error
        cy.get('.EnterSupportEmailStep__body--error').should('be.visible').should('contain', 'Something went wrong while setting the support email. Try again.');
    });

    it('type support email and successfully complete step', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Enter support email step
        cy.get('button.NextStepsView__cardHeader:contains(Enter support email)').scrollIntoView().should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .EnterSupportEmailStep').should('be.visible');

        // # Enter email addresses
        cy.get('#input_enter_support_email').should('be.visible').type('robot@gmail.com');

        // # Click Finish button
        cy.findByTestId('EnterSupportEmailStep__finishButton').should('be.visible').and('not.be.disabled').click();

        // * Check that ui card shows step is complete
        cy.get('.complete').should('be.visible').should('contain', 'Enter support email');

        // * Further check that enter_support_email step is now true ot completed
        cy.apiGetUserPreference('me').then((preferences) => {
            cy.wrap(preferences.filter((pref) => pref.name === 'enter_support_email')[0]).its('value').should('eq', 'true');
        });
    });
});
