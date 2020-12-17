// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @team_settings

import {getRandomId} from '../../utils';
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Team Settings', () => {
    const randomId = getRandomId();
    const emailDomain = 'sample.mattermost.com';
    let testTeam;

    before(() => {
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: false,
            },
            LdapSettings: {
                Enable: false,
            },
        });
    });

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.visit(`/${team.name}`);
        });
    });

    it('MM-T387 - Try to join a closed team from a NON-mattermost email address via "Get Team Invite Link" while "Allow only users with a specific email domain to join this team" set to "sample.mattermost.com"', () => {
        // Open 'Team Settings' modal
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.findByText('Team Settings').should('be.visible').click();

        // * Check that the 'Team Settings' modal was opened
        cy.get('#teamSettingsModal').should('exist').within(() => {
            // # Click on the 'Allow only users with a specific email domain to join this team' edit button
            cy.get('#allowed_domainsEdit').should('be.visible').click();

            // # Set 'sample.mattermost.com' as the only allowed email domain and save
            cy.wait(TIMEOUTS.HALF_SEC);
            cy.focused().type(emailDomain);
            cy.findByText('Save').should('be.visible').click();

            // # Close the modal
            cy.get('#teamSettingsModalLabel').find('button').should('be.visible').click();
        });

        // # Open the 'Invite People' full screen modal and get the invite url
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.get('#invitePeople').find('button').eq(0).click();
        cy.get('.share-link-input').invoke('val').then((val) => {
            const inviteLink = val;

            // # Logout from admin account and visit the invite url
            cy.apiLogout();
            cy.visit(inviteLink);
        });

        const email = `user${randomId}@sample.gmail.com`;
        const username = `user${randomId}`;
        const password = 'passwd';
        const errorMessage = `The following email addresses do not belong to an accepted domain: ${emailDomain}. Please contact your System Administrator for details.`;

        // # Type email, username and password
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('#email').type(email);

        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('#name').type(username);

        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('#password').type(password);

        // # Attempt to create an account by clicking on the 'Create Account' buton
        cy.get('#createAccountButton').click();

        // * Assert that the expected error message from creating an account with an email not from the allowed email domain exists and is visible
        cy.findByText(errorMessage).should('be.visible');
    });

    it('MM-T2341 Cannot add a user to a team if the user\'s email is not from the correct domain', () => {
        // Open 'Team Settings' modal
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.findByText('Team Settings').should('be.visible').click();

        // * Check that the 'Team Settings' modal was opened
        cy.get('#teamSettingsModal').should('exist').within(() => {
            // # Click on the 'Allow any user with an account on this server to join this team' edit button
            cy.get('#open_inviteEdit').should('be.visible').click();

            // # Enable any user with an account on the server to join the team
            cy.get('#teamOpenInvite').should('be.visible').click();
            cy.findByText('Save').should('be.visible').click();

            // # Click on the 'Allow only users with a specific email domain to join this team' edit button
            cy.get('#allowed_domainsEdit').should('be.visible').click();

            // # Set 'sample.mattermost.com' as the only allowed email domain and save
            cy.wait(TIMEOUTS.HALF_SEC);
            cy.focused().type(emailDomain);
            cy.findByText('Save').should('be.visible').click();

            // # Close the modal
            cy.get('#teamSettingsModalLabel').find('button').should('be.visible').click();
        });

        // # Create a new user
        cy.apiCreateUser({user: {email: `user${randomId}@sample.gmail.com`, username: `user${randomId}`, password: 'passwd'}}).then(({user}) => {
            // # Create a second team
            cy.apiCreateTeam('other-team', 'Other Team').then(({team: otherTeam}) => {
                // # Add user to the other team
                cy.apiAddUserToTeam(otherTeam.id, user.id).then(() => {
                    // # Login as new team admin
                    cy.apiLogin(user);

                    // # Go to Town Square
                    cy.visit(`/${otherTeam.name}/channels/town-square`);

                    // # Click Main Menu
                    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

                    // # Click Manage Members
                    cy.get('#joinTeam').should('be.visible').click();

                    // # Try to join the existing team
                    cy.get('.signup-team-dir').find(`#${testTeam.display_name.replace(' ', '_')}`).scrollIntoView().click();

                    // * Verify that they get a 'Cannot join' screen
                    cy.get('div.has-error').should('contain', 'The user cannot be added as the domain associated with the account is not permitted.');
                });
            });
        });
    });
});

