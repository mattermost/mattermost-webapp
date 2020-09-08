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

            // # Verify new user email
            cy.apiVerifyUserEmailById(testUser.id);
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
        cy.findByTestId('terms-of-service').should('be.visible').and('contain.text', customTermsOfServiceText);

        // * Ensure that the accept terms button is visible and click it
        cy.get('#acceptTerms').should('be.visible').click();
    });

    after(() => {
        cy.apiAdminLogin();

        cy.apiUpdateConfig({
            EmailSettings: {
                RequireEmailVerification: false,
            },
            SupportSettings: {
                CustomTermsOfServiceEnabled: false,
            },
        });
    });
});
