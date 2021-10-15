// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @onboarding

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {generateRandomUser} from '../../../../support/api/user';

describe('Onboarding', () => {
    let testTeam;

    const {username, email, password} = generateRandomUser();

    before(() => {
        // # Disable LDAP
        cy.apiUpdateConfig({LdapSettings: {Enable: false}});

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T402 Finish Tutorial', () => {
        // # Open team menu and click on "Team Settings"
        cy.uiOpenTeamMenu('Team Settings');

        // * Check that the 'Team Settings' modal was opened
        cy.get('#teamSettingsModal').should('exist').within(() => {
            cy.get('#open_inviteEdit').should('be.visible').click();

            // # Enable any user with an account on the server to join the team
            cy.get('#teamOpenInvite').should('be.visible').click();
            cy.uiSaveAndClose();
        });

        // # Logout from sysadmin account
        cy.apiLogout();

        // # Visit the team url
        cy.visit(`/${testTeam.name}`);

        // # Attempt to create a new account
        cy.get('#signup', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').click();
        cy.get('#email').should('be.focused').and('be.visible').type(email);
        cy.get('#name').should('be.visible').type(username);
        cy.get('#password').should('be.visible').type(password);
        cy.get('#createAccountButton').should('be.visible').click();

        // * Check that the display name of the team the user was invited to is being correctly displayed
        cy.uiGetLHSHeader().findByText(testTeam.display_name);

        // * Check that 'Town Square' is currently being selected
        cy.get('.active').within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        // # Click next tip
        cy.get('#tipButton').should('be.visible').click();
        cy.get('.tip-overlay--chat').should('be.visible');
        cy.findByText('Send a message');
        cy.findByText('Got it').click();

        // # Click next tip
        cy.get('#tipButton').should('be.visible').click();
        cy.get('.tip-overlay--sidebar').should('be.visible');
        cy.findByText('Organize conversations in channels');
        cy.findByText('Got it').click();

        // # Click next tip
        cy.get('#tipButton').should('be.visible').click();
        cy.get('.tip-overlay--add-channels').should('be.visible');
        cy.findByText('Create and join channels');
        cy.findByText('Got it').click();

        // # Click next tip
        cy.get('#tipButton').should('be.visible').click();
        cy.get('.tip-overlay--header--left').should('be.visible');
        cy.findByText('Invite people');
        cy.findByText('Got it').click();

        // # Click next tip
        cy.get('#tipButton').should('be.visible').click();
        cy.get('.tip-overlay--settings').should('be.visible');
        cy.findByText('Customize your experience');
        cy.findByText('Got it').click();

        // # Reload the page without cache
        cy.reload(true);

        // * Check that 'Town Square' is currently being selected
        cy.get('.active', {timeout: TIMEOUTS.HALF_MIN}).within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        // # Assert that the tutorials do not appear
        cy.get('#tipButton').should('not.exist');
    });
});
