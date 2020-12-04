// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console @authentication

import * as TIMEOUTS from '../../../fixtures/timeouts';

const authenticator = require('authenticator');

describe('Authentication', () => {
    let mfaSysAdmin;
    let testUser;
    let adminMFASecret;

    before(() => {
        cy.apiRequireLicenseForFeature('MFA');

        // # Do email test if setup properly
        cy.apiEmailTest();

        cy.apiInitSetup().then(({user}) => {
            testUser = user;
        });

        // # Create and login a newly created user as sysadmin
        cy.apiCreateCustomAdmin().then(({mfaSysAdminCreated}) => {
            mfaSysAdmin = mfaSysAdminCreated;
        });

        // # Log in as a admin.
        cy.apiLogin(mfaSysAdmin);
    });

    it('MM-T1778 - MFA - Enforced', () => {
        // # Navigate to System Console -> Authentication -> MFA Page.
        cy.visit('/admin_console/authentication/mfa');
        cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Multi-factor Authentication');

        // # Ensure the setting 'Enable Multi factor authentication' is set to true in the MFA page.
        cy.findByTestId('ServiceSettings.EnableMultifactorAuthenticationtrue').check();

        // # Also ensure that this MFA setting is enforced.
        cy.findByTestId('ServiceSettings.EnforceMultifactorAuthenticationtrue').check();

        // # Click "Save".
        cy.get('#saveSetting').scrollIntoView().click();

        cy.url().then((url) => {
            if (url.includes('mfa/setup')) {
                // # Complete MFA setup if we are on token setup page /mfa/setup
                cy.get('#mfa').wait(TIMEOUTS.HALF_SEC).find('.col-sm-12').then((p) => {
                    const secretp = p.text();
                    adminMFASecret = secretp.split(' ')[1];

                    const token = authenticator.generateToken(adminMFASecret);
                    cy.get('#mfa').find('.form-control').type(token);
                    cy.get('#mfa').find('.btn.btn-primary').click();

                    cy.wait(TIMEOUTS.HALF_SEC);
                    cy.get('#mfa').find('.btn.btn-primary').click();
                });
            } else {
                // # If the sysadmin already has MFA enabled, reset the secret.
                cy.apiGenerateMfaSecret(mfaSysAdmin.id).then((res) => {
                    adminMFASecret = res.code.secret;
                });
            }
        });

        // # Navigate to System Console -> User Management -> Users
        cy.visit('/admin_console/user_management/users');
        cy.get('#searchUsers', {timeout: TIMEOUTS.ONE_MIN}).type(`${testUser.email}`);

        // * Remove MFA option not available for the user
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();
        cy.findByText('Remove MFA').should('not.be.visible');

        // # Login as test user
        cy.apiLogin(testUser);
        cy.visit('/');
        cy.get('.signup-team__container', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    });

    // This test relies on the previous test for having MFA enabled (MM-T1778)
    it('MM-T1781 - MFA - Admin removes another users MFA', () => {
        // # Login as test user
        cy.apiLogin(testUser);
        cy.visit('/');
        cy.wait(TIMEOUTS.ONE_SEC);

        let token;
        cy.url().then((url) => {
            if (url.includes('mfa/setup')) {
                // # Complete MFA setup if we are on token setup page /mfa/setup
                cy.get('#mfa').wait(TIMEOUTS.HALF_SEC).find('.col-sm-12').then((p) => {
                    const secretp = p.text();
                    const testUserMFASecret = secretp.split(' ')[1];

                    token = authenticator.generateToken(testUserMFASecret);
                    cy.get('#mfa').find('.form-control').type(token);
                    cy.get('#mfa').find('.btn.btn-primary').click();

                    cy.wait(TIMEOUTS.HALF_SEC);
                    cy.get('#mfa').find('.btn.btn-primary').click();
                });
            }
        });

        // # Login back as admin.
        token = authenticator.generateToken(adminMFASecret);
        cy.apiLoginWithMFA(mfaSysAdmin, token);

        // # Navigate to System Console -> User Management -> Users
        cy.visit('/admin_console/user_management/users');
        cy.get('#searchUsers', {timeout: TIMEOUTS.ONE_MIN}).type(`${testUser.email}`);

        // * Remove MFA option available for the user and click it
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();
        cy.findByText('Remove MFA').should('be.visible').click();

        // # Navigate to System Console -> Authentication -> MFA Page.
        cy.visit('/admin_console/authentication/mfa');
        cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Multi-factor Authentication');

        // # Also ensure that this MFA setting is enforced.
        cy.findByTestId('ServiceSettings.EnforceMultifactorAuthenticationfalse').check();

        // # Click "Save".
        cy.get('#saveSetting').scrollIntoView().click();

        // # Login as test user
        cy.apiLogin(testUser);
        cy.visit('/');
        cy.get('.signup-team__container').should('not.be.visible');
    });

    // This test relies on the previous test for having MFA enabled (MM-T1781)
    it('MM-T1782 - MFA - Removing MFA option hidden for users without MFA set up', () => {
        // # Login back as admin.
        const token = authenticator.generateToken(adminMFASecret);
        cy.apiLoginWithMFA(mfaSysAdmin, token);

        // # Navigate to System Console -> User Management -> Users
        cy.visit('/admin_console/user_management/users');
        cy.get('#searchUsers', {timeout: TIMEOUTS.ONE_MIN}).type(`${testUser.email}`);

        // * Remove MFA option available for the user and click it
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();
        cy.findByText('Remove MFA').should('not.be.visible');

        // # Done with that MFA stuff so we disable it all
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: false,
                EnforceMultifactorAuthentication: false,
            },
        });
    });
});
