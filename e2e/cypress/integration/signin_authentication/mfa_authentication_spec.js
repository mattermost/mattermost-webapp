// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @signin_authentication @mfa

import authenticator from 'authenticator';

import timeouts from '../../fixtures/timeouts';

import {fillCredentialsForUser} from './helpers';

describe('Authentication', () => {
    let testTeam;
    let testTeam2;
    let testUser;
    let testUser2;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;
        });

        cy.apiCreateUser().then(({user: user2}) => {
            testUser2 = user2;
            cy.apiAddUserToTeam(testTeam.id, testUser2.id);
        });

        cy.apiCreateTeam().then(({team}) => {
            testTeam2 = team;
            cy.apiAddUserToTeam(testTeam2.id, testUser.id);
            cy.apiAddUserToTeam(testTeam2.id, testUser2.id);
        });
    });

    beforeEach(() => {
        cy.apiAdminLogin({failOnStatusCode: false});
    });

    it('MM-T404 Set up Multi-factor Authentication (Email login) - Enabled but not enforced', () => {
        // # On a server with MFA enabled (but not enforced).
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: true,
            },
        });

        cy.apiLogin(testUser);

        // # Go to Account Settings > Security > Multi-factor Authentication > Edit
        cy.visit(`/${testTeam.name}/channels/town-square`).wait(timeouts.ONE_SEC);
        cy.uiOpenAccountSettingsModal('Security');
        cy.get('#mfaEdit').should('be.visible').click();
        cy.findByText('Add MFA to Account').should('be.visible').click();

        getUserSecret(testUser).then(({secret}) => {
            // # Logout
            cy.apiLogout();

            // # Enter credentials to log in
            cy.visit('/login');
            fillCredentialsForUser(testUser);

            // # Enter *incorrect* MFA token and verify it doesn't log you in
            fillMFACode('123456');
            cy.findByText('Invalid MFA token.').should('be.visible');

            // # Verify taken back to login page, re-enter credentials (if they're not already filled in)
            fillCredentialsForUser(testUser);

            // # Enter correct MFA token
            const token = authenticator.generateToken(secret);
            fillMFACode(token);

            // * Multi-factor Authentication is enabled, and login is successful only after entering the MFA code.
            cy.url().should('include', 'town-square');
        });
    });

    it('MM-T405 MFA - Remove', () => {
        // # Ensure MFA is enabled but not enforced (System Console > MFA)
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: true,
            },
        });

        cy.apiGenerateMfaSecret(testUser.id).then((res) => {
            let token = authenticator.generateToken(res.code.secret);
            cy.apiActivateUserMFA(testUser.id, true, token);
            cy.apiLogout();

            // # Sign in with an account using Email Authentication and MFA
            cy.visit('/login');
            fillCredentialsForUser(testUser);
            token = authenticator.generateToken(res.code.secret);
            fillMFACode(token);

            // # Go to Account Settings > Security > Multi-factor Authentication > Edit and Remove MFA
            cy.uiOpenAccountSettingsModal('Security');
            cy.get('#mfaEdit').should('be.visible').click();
            cy.findByText('Remove MFA from Account').should('be.visible').click();

            // # Log out
            cy.apiLogout();

            // # Log in again
            cy.visit('/login');
            fillCredentialsForUser(testUser);

            // * Login should be successful without having to enter an MFA code.
            cy.url().should('include', 'town-square');
        });
    });
});

function getUserSecret(user) {
    return cy.url().then((url) => {
        if (url.includes('mfa/setup')) {
            return cy.get('#mfa').wait(timeouts.HALF_SEC).find('.col-sm-12').then((p) => {
                const secretp = p.text();
                const secret = secretp.split(' ')[1];

                const token = authenticator.generateToken(secret);
                cy.get('#mfa').find('.form-control').type(token);
                cy.get('#mfa').find('.btn.btn-primary').click();

                cy.wait(timeouts.HALF_SEC);
                cy.get('#mfa').find('.btn.btn-primary').click();
                return cy.wrap({secret});
            });
        }

        // # If the user already has MFA enabled, reset the secret.
        return cy.apiGenerateMfaSecret(user.id).then((res) => {
            const secret = res.code.secret;
            return cy.wrap({secret});
        });
    });
}

function fillMFACode(code) {
    cy.wait(timeouts.TWO_SEC);
    cy.findByPlaceholderText('MFA Token').clear().type(code).wait(timeouts.ONE_SEC);
    cy.findByRole('button', {name: 'Submit'}).click();
}
