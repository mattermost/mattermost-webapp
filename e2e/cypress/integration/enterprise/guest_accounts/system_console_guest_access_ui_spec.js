// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @guest_account

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Guest Account - Verify Guest Access UI', () => {
    beforeEach(() => {
        // * Check if server has license for Guest Accounts
        cy.apiRequireLicenseForFeature('GuestAccounts');

        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
            ServiceSettings: {
                EnableMultifactorAuthentication: false,
            },
        });

        // # Visit System Console Users page
        cy.visit('/admin_console/authentication/guest_access');
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

        // # Visit System Console Users page
        cy.visit('/admin_console/authentication/guest_access');

        // * Verify Guest MFA field when System MFA is enabled
        cy.findByTestId('GuestAccountsSettings.EnforceMultifactorAuthenticationhelp-text').should('be.visible').and('have.text', 'Multi-factor authentication is currently not enforced.');
    });

    it('MM-T1410 Confirmation Modal when Guest Access is disabled', () => {
        // # Disable Guest Access and save
        cy.findByTestId('GuestAccountsSettings.Enablefalse').click();

        // * Verify the warning message
        cy.get('.error-message').should('be.visible').within(() => {
            cy.findByText('All current guest account sessions will be revoked, and marked as inactive').should('be.visible');
        });

        // # Click on the Save Settings
        cy.get('#saveSetting').should('be.visible').click();

        // * Verify the confirmation message displayed
        cy.get('#confirmModal').should('be.visible').within(() => {
            cy.get('#confirmModalLabel').should('be.visible').and('have.text', 'Save and Disable Guest Access?');
            cy.get('.modal-body').should('be.visible').and('have.text', 'Disabling guest access will revoke all current Guest Account sessions. Guests will no longer be able to login and new guests cannot be invited into Mattermost. Guest users will be marked as inactive in user lists. Enabling this feature will not reinstate previous guest accounts. Are you sure you wish to remove these users?');
            cy.get('#confirmModalButton').should('have.text', 'Save and Disable Guest Access');
        });

        // * Verify the behavior when Cancel button in the confirmation message is clicked
        cy.get('#cancelModalButton').click();
        cy.get('#confirmModal').should('not.exist');
        cy.get('.error-message').should('be.visible');

        // # Click on the Save Settings and confirm
        cy.get('#saveSetting').should('be.visible').click();
        cy.get('#confirmModalButton').should('be.visible').click();

        // # Visit the chat facing application
        cy.visit('/');

        // # Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // * Verify that an option to Invite via Guest should not be available
        cy.findByTestId('inviteGuestLink').should('not.exist');
        cy.findByTestId('inputPlaceholder').should('be.visible');
    });

    it('MM-T1411 Update Guest Users in User Management when Guest feature is disabled', () => {
        cy.apiCreateGuestUser().then(({guest}) => {
            // # Disable Guest Access and save
            cy.findByTestId('GuestAccountsSettings.Enablefalse').click();
            cy.get('#saveSetting').should('be.visible').click();
            cy.get('#confirmModalButton').should('be.visible').click().wait(TIMEOUTS.THREE_SEC);

            // # Visit the User Management Users page
            cy.visit('/admin_console/user_management/users');

            // # Search for the guest user
            cy.get('#searchUsers').should('be.visible').type(guest.username);
            cy.findByTestId('userListRow').within(() => {
                cy.findByText('Inactive').should('be.visible');
            });
        });
    });
});
