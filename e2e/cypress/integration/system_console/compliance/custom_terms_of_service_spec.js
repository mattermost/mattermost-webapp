// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console

describe('Custom Terms of Service', () => {
    const customTermsOfServiceText = 'Test custom terms of service';
    let testUser;
    let testTeam;

    before(() => {
        cy.apiAdminLogin();

        cy.apiUpdateConfig({
            EmailSettings: {
                RequireEmailVerification: true,
            },
            SupportSettings: {
                CustomTermsOfServiceEnabled: true,
            },
        });

        cy.apiCreateTermsOfService(customTermsOfServiceText);

        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;
        });
    });

    it('MM-T1190 - Appears after creating new account and verifying email address', () => {
        // # Verify new user email
        cy.apiVerifyUserEmailById(testUser.id);

        // # Login as the test user
        cy.apiLogin(testUser);

        // # Visit the test team town square
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // * Ensure that the terms of service text shows as expected
        cy.findByTestId('termsOfService').should('be.visible').and('contain.text', customTermsOfServiceText);

        // * Ensure that the accept terms button is visible and click it
        cy.get('#acceptTerms').should('be.visible').click();

        // * Ensure the user is redirected to the appropriate team after terms are accepted
        cy.url().should('include', `/${testTeam.name}/channels/town-square`);
    });

    it('MM-T1191 - Repeated edits must be agreed to', () => {
        cy.apiAdminLogin();

        cy.apiUpdateConfig({
            EmailSettings: {
                RequireEmailVerification: false,
            },
            SupportSettings: {
                CustomTermsOfServiceEnabled: true,
            },
        });

        const otherTermsOfService = 'Different custom terms of service';

        // # Login as the test user
        cy.apiLogin(testUser);

        // # Visit the test team town square
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // * Ensure that the terms of service is not displayed since
        cy.findByTestId('termsOfService').should('not.be.visible');

        // # Login as admin and create new terms of service
        cy.apiAdminLogin();
        cy.apiCreateTermsOfService(otherTermsOfService).then(() => {
            // # Login as the test user
            cy.apiLogin(testUser);

            // # Visit the test team town square
            cy.visit(`/${testTeam.name}/channels/town-square`);

            // * Ensure that the terms of service text shows as expected
            cy.findByTestId('termsOfService').should('be.visible').and('contain.text', otherTermsOfService);

            cy.apiLogout();
            cy.apiAdminLogin();
            cy.apiCreateTermsOfService(customTermsOfServiceText).then(() => {
                cy.wait(1000);

                // # Login as the test user
                cy.apiLogin(testUser);

                // # Visit the test team town square
                cy.visit(`/${testTeam.name}/channels/town-square`);

                // * Ensure that the terms of service text shows as expected
                cy.findByTestId('termsOfService').should('be.visible').and('contain.text', customTermsOfServiceText);

                // * Ensure that the accept terms button is visible and click it
                cy.get('#acceptTerms').should('be.visible').click();

                // * Ensure the user is redirected to the appropriate team after terms are accepted
                cy.url().should('include', `/${testTeam.name}/channels/town-square`);
            });
        });
    });
});
