// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @not_cloud @enterprise @guest_account @mfa

/**
 * Note: This test requires Enterprise license to be uploaded
 */

import authenticator from 'authenticator';

import * as TIMEOUTS from '../../../fixtures/timeouts';
import {
    getJoinEmailTemplate,
    getRandomId,
    reUrl,
    verifyEmailBody,
} from '../../../utils';

describe('Guest Accounts', () => {
    let sysadmin;
    let testTeam;
    let testChannel;
    let adminMFASecret;
    const username = 'g' + getRandomId(); // username has to start with a letter.

    before(() => {
        cy.shouldNotRunOnCloudEdition();
        cy.apiRequireLicenseForFeature('GuestAccounts');

        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;
        });

        // # Log in as a team admin.
        cy.apiAdminLogin().then((res) => {
            sysadmin = res.user;
        });
    });

    after(() => {
        // # Login back as admin.
        const token = authenticator.generateToken(adminMFASecret);
        cy.apiAdminLoginWithMFA(token);

        // # Update Configs.
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: false,
                EnforceMultifactorAuthentication: false,
            },
            GuestAccountsSettings: {
                Enable: true,
                EnforceMultifactorAuthentication: false,
            },
        });
    });

    it('MM-T1390 Enforce Guest MFA when MFA is enabled and enforced', () => {
        // # Navigate to System Console -> Authentication -> MFA Page.
        cy.visit('/admin_console/authentication/mfa');

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
                cy.apiGenerateMfaSecret(sysadmin.id).then((res) => {
                    adminMFASecret = res.code.secret;
                });
            }
        });

        // # Navigate to Guest Access page.
        cy.visit('/admin_console/authentication/guest_access');

        // # Enable guest accounts.
        cy.findByTestId('GuestAccountsSettings.Enabletrue').check();

        // # Check if user is allowed to enforce MFA for Guest accounts.
        cy.findByTestId('GuestAccountsSettings.EnforceMultifactorAuthenticationtrue').check();

        // # Click "Save".
        cy.get('#saveSetting').scrollIntoView().click();

        const guestEmail = `${username}@sample.mattermost.com`;

        // # From the main page, invite a Guest user and click on the Join Team in the email sent to the guest user.
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Open team menu, click Invite People, then invite guest
        cy.uiOpenTeamMenu('Invite People');
        cy.findByTestId('inviteGuestLink').find('.arrow').click();

        // # Type guest user e-mail address.
        cy.findByTestId('emailPlaceholder').should('be.visible').within(() => {
            cy.get('input').type(guestEmail + '{enter}', {force: true});
            cy.get('.users-emails-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', `Invite ${guestEmail} as a guest`).click();
        });

        // # Search and add to a Channel.
        cy.findByTestId('channelPlaceholder').should('be.visible').within(() => {
            cy.get('input').type(testChannel.name, {force: true});
            cy.get('.channels-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', testChannel.name).click();
        });

        cy.get('#inviteGuestButton').scrollIntoView().click();
        cy.get('#closeIcon').should('be.visible').click();

        // # Get invitation link.
        cy.getRecentEmail({username, email: guestEmail}).then((data) => {
            const {body: actualEmailBody, subject} = data;

            // # Verify that the email subject is about joining.
            expect(subject).to.contain(`${sysadmin.username} invited you to join the team ${testTeam.display_name} as a guest`);

            const expectedEmailBody = getJoinEmailTemplate(sysadmin.username, guestEmail, testTeam, true);
            verifyEmailBody(expectedEmailBody, actualEmailBody);

            // # Extract invitation link from the invitation e-mail.
            const invitationLink = actualEmailBody[3].match(reUrl)[0];

            // # Logout sysadmin.
            cy.apiLogout();
            cy.visit(invitationLink);
        });

        // # Create an account with Email and Password.
        cy.findAllByText('Email and Password').click();
        cy.get('#name').type(username);
        cy.get('#password').type(username);
        cy.findByText('Create Account').click();

        // * When MFA is enforced for Guest Access, guest user should be forced to configure MFA while creating an account.
        cy.url().should('include', 'mfa/setup');
        cy.get('#mfa').wait(TIMEOUTS.HALF_SEC).find('.col-sm-12').then((p) => {
            const secretp = p.text();
            const secret = secretp.split(' ')[1];

            const token = authenticator.generateToken(secret);
            cy.get('#mfa').find('.form-control').type(token);
            cy.get('#mfa').find('.btn.btn-primary').click();

            cy.wait(TIMEOUTS.ONE_SEC);
            cy.get('#mfa').find('.btn.btn-primary').click();
        });
        cy.apiLogout();
    });
});
