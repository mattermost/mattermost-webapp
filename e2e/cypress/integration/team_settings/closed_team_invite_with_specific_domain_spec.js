
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @team_settings

import * as TIMEOUTS from '../../fixtures/timeouts';
import {generateRandomUser} from '../../support/api/user';

import {inviteUserByEmail, verifyEmailInviteAndVisitLink, typeUsernameAndPassword, verifyInitialTutorial} from './helpers';

describe('Team Settings', () => {
    let testTeam;
    const {username, email, password} = generateRandomUser();
    const emailDomain = 'sample.mattermost.com';

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

    it('MM-T386 Invite new user to closed team with \'Allow only users with a specific email domain to join this team\' set to \'sample.mattermost.com\'', () => {
        // # Open 'Team Settings' modal
        cy.findByLabelText('main menu').should('be.visible').click();
        cy.findByText('Team Settings').should('be.visible').click();

        // * Check that the 'Team Settings' modal was opened
        cy.get('#teamSettingsModal').should('exist').within(() => {
            // * Ensure that 'Allow any user with an account on this server' is set to 'No'
            cy.get('#open_inviteDesc').should('have.text', 'No');

            // # Click on the 'Allow only users with a specific email domain to join this team' edit button
            cy.get('#allowed_domainsEdit').should('be.visible').click();

            // # Set 'sample.mattermost.com' as the only allowed email save
            cy.focused().type(emailDomain);
            cy.findByText('Save').should('be.visible').click();

            // # Close the modal
            cy.get('#teamSettingsModalLabel').find('button').should('be.visible').click();
        });

        // # Open the 'Invite People' full screen modal
        cy.findByLabelText('main menu').should('be.visible').click();
        cy.findByText('Invite People').should('be.visible').click();

        // # Wait half a second to ensure that the modal has been fully loaded
        cy.wait(TIMEOUTS.HALF_SEC);

        // # Invite user via email
        inviteUserByEmail(email, isLicensed);

        // # Logout from sysadmin account
        cy.apiLogout();

        // # Invite a new user (with the email declared in the parent scope)
        verifyEmailInviteAndVisitLink(username, email, testTeam.name, testTeam.display_name);

        // # Type username and password
        typeUsernameAndPassword(username, password);

        // # Attempt to create an account by clicking on the 'Create Account' button
        cy.get('#createAccountButton').click();

        // * Check that the display name of the team the user was invited to is being correctly displayed
        cy.get('#headerTeamName', {timeout: TIMEOUTS.HALF_MIN}).should('contain.text', testTeam.display_name);

        // * Check that the 'Welcome to: Mattermost' message is visible
        verifyInitialTutorial();
    });
});
