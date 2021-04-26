// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @onboarding

import * as TIMEOUTS from '../../fixtures/timeouts';
import {generateRandomUser} from '../../support/api/user';
import {
    getEmailUrl,
    reUrl,
    splitEmailBodyText,
} from '../../utils';

describe('Onboarding', () => {
    let testTeam;
    const user = generateRandomUser();
    const {username, email, password} = user;

    const baseUrl = Cypress.config('baseUrl');
    const mailUrl = getEmailUrl(baseUrl);
    let isCloudLicensed;
    let isLicensed;

    before(() => {
        cy.apiGetClientLicense().then((data) => {
            ({isLicensed, isCloudLicensed} = data);
        });

        // # Do email test if setup properly
        cy.apiEmailTest();

        // # Update config to require email verification
        cy.apiUpdateConfig({
            EmailSettings: {
                RequireEmailVerification: true,
            },
        });

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.visit(`/${team.name}`);
        });
    });

    it('MM-T398 Use team invite link to sign up using email and password', () => {
        // # Open the 'Invite People' full screen modal and get the invite url
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.get('#invitePeople').find('button').eq(0).click();

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
        cy.get('#email', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').type(email);
        cy.get('#name').should('be.visible').type(username);
        cy.get('#password').should('be.visible').type(password);

        // # Attempt to create an account by clicking on the 'Create Account' button
        cy.get('#createAccountButton').click();

        cy.wait(TIMEOUTS.HALF_SEC);

        // * Check that 'Mattermost: You are almost done' text should be visible when email hasn't been verified yet
        cy.get('.signup-team__container').should('be.visible').within(() => {
            cy.findByText('Mattermost: You are almost done').should('be.visible');
        });

        cy.task('getRecentEmail', {username, mailUrl}).then((response) => {
            verifyEmailInvite(response, email);

            const bodyText = splitEmailBodyText(response.data.body.text);
            const permalink = bodyText[4].match(reUrl)[0];

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
        cy.get('#headerTeamName').should('contain.text', testTeam.display_name);

        // * Check that 'Town Square' is currently being selected
        cy.get('.active').within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        // * Check that the 'Welcome to Mattermost' message is visible
        if (isCloudLicensed) {
            cy.get('.NextStepsView__header-headerText').findByText('Welcome to Mattermost').should('be.visible');
        } else {
            cy.get('#tutorialIntroOne').should('be.visible').
                and('contain', 'Welcome to:').
                and('contain', 'Mattermost').
                and('contain', 'Your team communication all in one place, instantly searchable and available anywhere.').
                and('contain', 'Keep your team connected to help them achieve what matters most.');
        }
    });

    function verifyEmailInvite(response, userEmail) {
        const isoDate = new Date().toISOString().substring(0, 10);
        const {data, status} = response;

        // * Should return success status
        expect(status).to.equal(200);

        // * Verify that email is addressed to the correct user
        expect(data.to.length).to.equal(1);
        expect(data.to[0]).to.contain(userEmail);

        // * Verify that date is current
        expect(data.date).to.contain(isoDate);

        // * Verify that the email subject is correct
        expect(data.subject).to.contain(`[Mattermost] You joined ${baseUrl.split('/')[2]}`);

        // * Verify that the email body is correct
        const bodyText = splitEmailBodyText(data.body.text);
        expect(bodyText.length).to.equal(15);
        expect(bodyText[1]).to.equal(`Thanks for joining ${baseUrl.split('/')[2]}. ( ${baseUrl} )`);
        expect(bodyText[2]).to.equal('Click below to verify your email address.');
    }
});

