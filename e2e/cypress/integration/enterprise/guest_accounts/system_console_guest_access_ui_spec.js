// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
 * Note: This test requires Enterprise license to be uploaded
 */

let guest;

describe('Guest Account - Verify Guest Access UI', () => {
    before(() => {
        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
            ServiceSettings: {
                EnableMultifactorAuthentication: false,
            },
        });

        // # Login as new user
        cy.loginAsNewUser().then((userResponse) => {
            guest = userResponse;

            // # Demote the current member to a guest user
            cy.demoteUser(guest.id);
        });

        // # Login as SysAdmin
        cy.apiLogin('sysadmin');

        // # Visit System Console Users page
        cy.visit('/admin_console/authentication/guest_access');
    });

    after(() => {
        // # Reset MFA
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: false,
            },
        });
    });

    it('MM-18046 Verify Guest Access Screen', () => {
        // * Verify Enable Guest Access field
        cy.findByTestId('GuestAccountsSettings.Enable').should('be.visible').within(() => {
            cy.get('.control-label').should('be.visible').and('have.text', 'Enable Guest Access: ');
        });
        cy.findByTestId('GuestAccountsSettings.Enablehelp-text').should('be.visible').and('have.text', 'When true, external guest can be invited to channels within teams. Please see Permissions Schemes for which roles can invite guests.');

        // * Verify Whitelisted Guest Domains field
        cy.findByTestId('GuestAccountsSettings.RestrictCreationToDomains').should('be.visible').within(() => {
            cy.get('.control-label').should('be.visible').and('have.text', 'Whitelisted Guest Domains:');
        });
        cy.findByTestId('GuestAccountsSettings.RestrictCreationToDomainshelp-text').should('be.visible').and('have.text', '(Optional) Guest accounts can be created at the system level from this list of allowed guest domains.');

        // * Verify Guest MFA field when System MFA is not enabled
        cy.findByTestId('GuestAccountsSettings.EnforceMultifactorAuthentication').should('be.visible').within(() => {
            cy.get('.control-label').should('be.visible').and('have.text', 'Enforce Multi-factor Authentication: ');
        });
        cy.findByTestId('GuestAccountsSettings.EnforceMultifactorAuthenticationhelp-text').should('be.visible').and('have.text', 'Multi-factor authentication is currently not enabled.');

        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: true,
            },
        });

        // # Login as SysAdmin
        cy.apiLogin('sysadmin');

        // # Visit System Console Users page
        cy.visit('/admin_console/authentication/guest_access');

        // * Verify Guest MFA field when System MFA is enabled
        cy.findByTestId('GuestAccountsSettings.EnforceMultifactorAuthenticationhelp-text').should('be.visible').and('have.text', 'Multi-factor authentication is currently not enforced.');
    });
});
