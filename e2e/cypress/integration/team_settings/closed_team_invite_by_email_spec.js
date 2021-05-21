// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @team_settings

import {getAdminAccount} from '../../support/env';
import * as TIMEOUTS from '../../fixtures/timeouts';
import {
    getJoinEmailTemplate,
    getRandomId,
    reUrl,
    verifyEmailBody,
} from '../../utils';

describe('Team Settings', () => {
    const sysadmin = getAdminAccount();
    const randomId = getRandomId();
    const username = `user${randomId}`;
    const email = `user${randomId}@sample.mattermost.com`;
    const password = 'passwd';

    let testTeam;
    let siteName;
    let isCloudLicensed;
    let isLicensed;

    before(() => {
        // # If the instance the test is running on is licensed, assign true to isLicensed variable
        cy.apiGetClientLicense().then((data) => {
            ({isLicensed, isCloudLicensed} = data);
        });

        // # Disable LDAP and do email test if setup properly
        cy.apiUpdateConfig({LdapSettings: {Enable: false}}).then(({config}) => {
            siteName = config.TeamSettings.SiteName;
        });
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
        cy.getRecentEmail({username, email}).then((data) => {
            const {body: actualEmailBody, subject} = data;

            // * Verify email subject
            expect(subject).to.contain(`[${siteName}] ${sysadmin.username} invited you to join ${testTeam.display_name} Team`);

            // * Verify email body
            const expectedEmailBody = getJoinEmailTemplate(sysadmin.username, email, testTeam);
            verifyEmailBody(expectedEmailBody, actualEmailBody);

            // # Visit permalink (e.g. click on email link)
            const permalink = actualEmailBody[3].match(reUrl)[0];
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
});

