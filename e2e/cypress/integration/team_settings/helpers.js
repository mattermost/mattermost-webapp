// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

import {getEmailUrl, getEmailMessageSeparator, reUrl} from '../../utils';
const baseUrl = Cypress.config('baseUrl');
const mailUrl = getEmailUrl(baseUrl);

export const allowOnlyUserFromSpecificDomain = (domain) => {
    // # Open 'Team Settings' modal
    cy.get('.sidebar-header-dropdown__icon').click();
    cy.findByText('Team Settings').should('be.visible').click();

    // * Check that the 'Team Settings' modal was opened
    cy.get('#teamSettingsModal').should('exist').within(() => {
        // * Ensure that 'Allow any user with an account on this server' is set to 'No'
        cy.get('#open_inviteDesc').should('have.text', 'No');

        // # Click on the 'Allow only users with a specific email domain to join this team' edit button
        cy.get('#allowed_domainsEdit').should('be.visible').click();

        // # Set the allowed domain as the one received as the param and save
        cy.focused().type(domain);
        cy.findByText('Save').should('be.visible').click();

        // # Close the modal
        cy.get('#teamSettingsModalLabel').find('button').should('be.visible').click();
    });
};

export const inviteUserByEmail = (email) => {
    // # Open the 'Invite People' full screen modal
    cy.get('.sidebar-header-dropdown__icon').click();
    cy.get('#invitePeople').find('button').eq(0).click();

    // # Wait half a second to ensure that the modal has been fully loaded
    cy.wait(TIMEOUTS.HALF_SEC);

    cy.findByRole('textbox', {name: 'Add or Invite People'}).type(email, {force: true}).wait(TIMEOUTS.HALF_SEC).type('{enter}', {force: true});
    cy.get('#inviteMembersButton').click();

    // # Wait for a while to ensure that email notification is sent
    cy.wait(TIMEOUTS.TWO_SEC);
};

export const verifyEmailInviteAndVisitLink = (username, email, teamName, teamDisplayName) => {
    // # Invite a new user
    cy.task('getRecentEmail', {username, mailUrl}).then((response) => {
        const messageSeparator = getEmailMessageSeparator(baseUrl);
        verifyEmailInvite(response, teamName, teamDisplayName, email, messageSeparator);

        const bodyText = response.data.body.text.split('\n');
        const permalink = bodyText[6].match(reUrl)[0];

        // # Visit permalink (e.g. click on email link)
        cy.visit(permalink);
        cy.get('#signup_email_section', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible');
    });
};

export const signupAndVerifyTutorial = (username, password, teamDisplayName) => {
    cy.get('#name', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').type(username);
    cy.get('#password').should('be.visible').type(password);

    // # Attempt to create an account by clicking on the 'Create Account' button
    cy.get('#createAccountButton').click();

    // * Check that the display name of the team the user was invited to is being correctly displayed
    cy.get('#headerTeamName', {timeout: TIMEOUTS.HALF_MIN}).should('contain.text', teamDisplayName);

    // * Check that the 'Welcome to: Mattermost' message is visible
    cy.get('#tutorialIntroOne').findByText('Welcome to:').should('be.visible');
    cy.get('#tutorialIntroOne').findByText('Mattermost').should('be.visible');

    // * Check that 'Town Square' is currently being selected
    cy.get('.active').within(() => {
        cy.get('#sidebarItem_town-square').should('exist');
    });

    // * Check that the 'Welcome to: Mattermost' message is visible
    cy.get('#tutorialIntroOne').findByText('Welcome to:').should('be.visible');
    cy.get('#tutorialIntroOne').findByText('Mattermost').should('be.visible');
};

const verifyEmailInvite = (response, teamName, teamDisplayName, email, messageSeparator) => {
    const isoDate = new Date().toISOString().substring(0, 10);
    const {data, status} = response;

    // * Should return success status
    expect(status).to.equal(200);

    // * Verify that email is addressed to the correct user
    expect(data.to.length).to.equal(1);
    expect(data.to[0]).to.contain(email);

    // * Verify that date is current
    expect(data.date).to.contain(isoDate);

    // * Verify that the email subject is correct
    expect(data.subject).to.contain(`[Mattermost] sysadmin invited you to join ${teamDisplayName} Team`);

    // * Verify that the email body is correct
    const bodyText = data.body.text.split(messageSeparator);
    expect(bodyText.length).to.equal(17);
    expect(bodyText[1]).to.equal('You\'ve been invited');
    expect(bodyText[4]).to.equal(`*sysadmin* , has invited you to join *${teamDisplayName}*.`);
    expect(bodyText[10]).to.contain(`${baseUrl}/${teamName}`);
};
