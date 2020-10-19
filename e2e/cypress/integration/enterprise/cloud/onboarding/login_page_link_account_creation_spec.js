
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @onboarding

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {generateRandomUser} from '../../../../support/api/user';
import {getEmailUrl, getEmailMessageSeparator, reUrl} from '../../../../utils';

describe('Onboarding', () => {
    let testTeam;
    const {username, email, password} = generateRandomUser();

    const baseUrl = Cypress.config('baseUrl');
    const mailUrl = getEmailUrl(baseUrl);

    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');

        // # Disable LDAP, require email invitation, and do email test if setup properly
        cy.apiUpdateConfig({LdapSettings: {Enable: false}, EmailSettings: {RequireEmailVerification: true}});
        cy.apiEmailTest();

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T400 Create account from login page link using email-password', () => {
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.findByText('Team Settings').should('be.visible').click();

        // * Check that the 'Team Settings' modal was opened
        cy.get('#teamSettingsModal').should('exist').within(() => {
            cy.get('#open_inviteEdit').should('be.visible').click();

            // # Enable any user with an account on the server to join the team
            cy.get('#teamOpenInvite').should('be.visible').click();
            cy.findByText('Save').should('be.visible').click();

            // # Close the modal
            cy.get('#teamSettingsModalLabel').find('button').should('be.visible').click();
        });

        // * In system console, verify that 'Enable Open Server' is set to true
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.get('#systemConsole').should('be.visible').click();
        cy.findByText('Signup').scrollIntoView().should('be.visible').click();
        cy.get(`#${CSS.escape('TeamSettings.EnableOpenServertrue')}`).should('be.checked');

        // # Logout from sysadmin account
        cy.apiLogout();

        // # Visit the team url
        cy.visit(`/${testTeam.name}`);

        // # Attempt to create a new account
        cy.get('#login_section', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
        cy.get('#signup').should('be.visible').click();
        cy.get('#email').should('be.focused').and('be.visible').type(email);
        cy.get('#name').should('be.visible').type(username);
        cy.get('#password').should('be.visible').type(password);
        cy.get('#createAccountButton').should('be.visible').click();

        cy.findByText('Mattermost: You are almost done').should('be.visible');

        // # Get invitation email and go to the provided link
        getEmail(username, email);

        // * Ensure that the email was correctly verified
        cy.findByText('Email Verified').should('be.visible');

        // * Ensure that the email was pre-filled and the password input box is focused
        cy.get('#loginId').should('be.visible').and('have.value', email);
        cy.get('#loginPassword').should('be.visible').and('be.focused').type(password);

        // # Click on the login button
        cy.get('#loginButton').click();

        // * Check that the display name of the team the user was invited to is being correctly displayed
        cy.get('#headerTeamName', {timeout: TIMEOUTS.HALF_MIN}).should('contain.text', testTeam.display_name);

        // * Check that 'Town Square' is currently being selected
        cy.get('.active').within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        // * Check that the 'Welcome to Mattermost' message is visible
        cy.get('.NextStepsView__header-headerText').findByText('Welcome to Mattermost').should('be.visible');
    });

    // eslint-disable-next-line no-shadow
    function getEmail(username, email) {
        cy.task('getRecentEmail', {username, mailUrl}).then((response) => {
            const messageSeparator = getEmailMessageSeparator(baseUrl);
            verifyEmailVerification(response, testTeam.name, testTeam.display_name, email, messageSeparator);

            const bodyText = response.data.body.text.split('\n');
            const permalink = bodyText[6].match(reUrl)[0];

            // # Visit permalink (e.g. click on email link)
            cy.visit(permalink);
        });
    }

    function verifyEmailVerification(response, teamName, teamDisplayName, userEmail, messageSeparator) {
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
        expect(data.subject).to.contain('[Mattermost] You joined localhost:8065');

        // * Verify that the email body is correct
        const bodyText = data.body.text.split(messageSeparator);
        expect(bodyText.length).to.equal(23);
        expect(bodyText[1]).to.equal('You\'ve joined localhost:8065');
        expect(bodyText[4]).to.equal('Please verify your email address by clicking below.');
    }
});
