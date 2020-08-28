// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

import {getEmailUrl, getEmailMessageSeparator, reUrl} from '../../utils';
const baseUrl = Cypress.config('baseUrl');
const mailUrl = getEmailUrl(baseUrl);

export const inviteUserByEmail = (email, isLicensed) => {
    if (isLicensed) {
        // # Click "Invite members"
        cy.findByTestId('inviteMembersLink').should('be.visible').click();
    }

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
    });
};

export const typeUsernameAndPassword = (username, password) => {
    cy.get('#name', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').type(username);
    cy.get('#password').should('be.visible').type(password);
};

export const verifyInitialTutorial = () => {
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
