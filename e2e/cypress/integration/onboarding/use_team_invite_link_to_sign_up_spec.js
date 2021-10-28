// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @onboarding

import * as TIMEOUTS from '../../fixtures/timeouts';
import {generateRandomUser} from '../../support/api/user';
import {
    getWelcomeEmailTemplate,
    reUrl,
    verifyEmailBody,
} from '../../utils';

describe('Onboarding', () => {
    let testTeam;
    let isLicensed;
    let siteName;

    before(() => {
        cy.apiGetClientLicense().then((data) => {
            ({isLicensed} = data);
        });

        // # Do email test if setup properly
        cy.shouldHaveEmailEnabled();

        // # Update config to require email verification and onboarding flow
        cy.apiUpdateConfig({
            ServiceSettings: {EnableOnboardingFlow: true},
            EmailSettings: {
                RequireEmailVerification: true,
            },
        }).then(({config}) => {
            siteName = config.TeamSettings.SiteName;
        });

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.visit(`/${team.name}`);
        });
    });

    it('MM-T398 Use team invite link to sign up using email and password', () => {
        // # Open the 'Invite People' full screen modal and get the invite url
        cy.uiOpenTeamMenu('Invite People');

        if (isLicensed) {
            // # Click "Invite members"
            cy.findByTestId('inviteMembersLink').should('be.visible').click();
        }

        cy.get('.share-link-input').invoke('val').then((val) => {
            const inviteLink = val;

            // # Logout from admin account and visit the invite url
            cy.apiLogout();
            cy.visit(inviteLink);
        });

        if (isLicensed) {
            // # Click Email and Password link
            cy.get('.signup__content', {timeout: TIMEOUTS.ONE_MIN}).findByText('Email and Password').click();
        }

        // * Verify it's on email signup page
        cy.get('#signup_email_section').should('be.visible');

        // # Type email, username and password
        const user = generateRandomUser();
        const {username, email, password} = user;
        cy.get('#email', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').type(email);
        cy.get('#name').should('be.visible').type(username);
        cy.get('#password').should('be.visible').type(password);

        // # Attempt to create an account by clicking on the 'Create Account' button
        cy.get('#createAccountButton').click();

        cy.wait(TIMEOUTS.HALF_SEC);

        // * Check that 'Mattermost: You are almost done' text should be visible when email hasn't been verified yet
        cy.findByText('Mattermost: You are almost done').should('be.visible');

        cy.getRecentEmail(user).then((data) => {
            const {body: expectedBody} = data;
            const expectedEmailBody = getWelcomeEmailTemplate(user.email, siteName, testTeam.name);

            // * Verify email body
            verifyEmailBody(expectedEmailBody, expectedBody);

            const permalink = expectedBody[4].match(reUrl)[0];

            // * Check that URL in address bar does not have an `undefined` team name appended
            cy.url().should('not.include', 'undefined');

            // # Visit permalink (e.g. click on email link)
            cy.visit(permalink);

            // # Check that 'Email Verified' text should be visible, email is pre-filled, and password field is focused, then login
            cy.findByText('Email Verified', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible');
            cy.get('#loginId').should('have.value', email);
            cy.get('#loginPassword').should('be.visible').type(password);
            cy.get('#loginButton').click();
            cy.findByText('Enter a valid email or username and/or password.').should('not.exist');
        });

        // * Check that the display name of the team the user successfully joined is correct
        cy.uiGetLHSHeader().findByText(testTeam.display_name);

        // * Check that 'Town Square' is currently being selected
        cy.get('.active').within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        // * Check that the 'Welcome to Mattermost' message is visible
        cy.findByText('Welcome to Mattermost').should('be.visible');
    });
});
