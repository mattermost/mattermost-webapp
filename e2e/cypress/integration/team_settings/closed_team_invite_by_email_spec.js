// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @team_settings

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getEmailUrl, getEmailMessageSeparator, reUrl, getRandomId} from '../../utils';

describe('Team Settings', () => {
    let testTeam;
    const randomId = getRandomId();
    const username = `user${randomId}`;
    const email = `user${randomId}@sample.mattermost.com`;
    const password = 'passwd';

    const baseUrl = Cypress.config('baseUrl');
    const mailUrl = getEmailUrl(baseUrl);
    let isLicensed;

    before(() => {
        // # If the instance the test is running on is licensed, assign true to isLicensed variable
        cy.apiGetClientLicense().then(({license}) => {
            isLicensed = license.IsLicensed === 'true';
        });

        // # Disable LDAP and do email test if setup properly
        cy.apiUpdateConfig({LdapSettings: {Enable: false}});
        cy.apiEmailTest();

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T385 Invite new user to closed team using email invite', () => {
        // # Open 'Team Settings' modal
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.findByText('Team Settings').should('be.visible').click();

        // * Check that the 'Team Settings' modal was opened
        cy.get('#teamSettingsModal').should('exist').within(() => {
            cy.get('#open_inviteDesc').should('have.text', 'No');

            // # Click on the 'Allow only users with a specific email domain to join this team' edit button
            cy.get('#allowed_domainsEdit').should('be.visible').click();

            // * Verify that the '#allowedDomains' input field is empty
            cy.get('#allowedDomains').should('be.empty');

            // # Close the modal
            cy.get('#teamSettingsModalLabel').find('button').should('be.visible').click();
        });

        // # Open the 'Invite People' full screen modal
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.get('#invitePeople').find('button').eq(0).click();

        // # Wait half a second to ensure that the modal has been fully loaded
        cy.wait(TIMEOUTS.HALF_SEC);

        if (isLicensed) {
            // # Click "Invite members"
            cy.findByTestId('inviteMembersLink').should('be.visible').click();
        }

        cy.findByRole('textbox', {name: 'Add or Invite People'}).type(email, {force: true}).wait(TIMEOUTS.HALF_SEC).type('{enter}', {force: true});
        cy.get('#inviteMembersButton').click();

        // # Wait for a while to ensure that email notification is sent and logout from sysadmin account
        cy.wait(TIMEOUTS.FIVE_SEC);
        cy.apiLogout();

        // # Invite a new user (with the email declared in the parent scope)
        cy.task('getRecentEmail', {username, mailUrl}).then((response) => {
            const messageSeparator = getEmailMessageSeparator(baseUrl);
            verifyEmailInvite(response, testTeam.name, testTeam.display_name, email, messageSeparator);

            const bodyText = response.data.body.text.split('\n');
            const permalink = bodyText[6].match(reUrl)[0];

            // # Visit permalink (e.g. click on email link)
            cy.visit(permalink);
        });

        // # Type username and password
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('#name').type(username);
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('#password').type(password);

        // # Attempt to create an account by clicking on the 'Create Account' button
        cy.get('#createAccountButton').click();

        // * Check that the display name of the team the user was invited to is being correctly displayed
        cy.get('#headerTeamName').should('contain.text', testTeam.display_name);

        // * Check that 'Town Square' is currently being selected
        cy.get('.active').within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        // * Check that the 'Welcome to Mattermost' message is visible
        cy.get('.NextStepsView__header-headerText').findByText('Welcome to Mattermost').should('be.visible');
    });

    function verifyEmailInvite(response, teamName, teamDisplayName, invitedUserEmail, messageSeparator) {
        const isoDate = new Date().toISOString().substring(0, 10);
        const {data, status} = response;

        // * Should return success status
        expect(status).to.equal(200);

        // * Verify that email is addressed to the correct user
        expect(data.to.length).to.equal(1);
        expect(data.to[0]).to.contain(invitedUserEmail);

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
    }
});

