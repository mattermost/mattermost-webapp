
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @onboarding
// Skip:  @electron @chrome @firefox

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {generateRandomUser} from '../../../../support/api/user';

describe('Onboarding', () => {
    let testTeam;
    const {username, email, password} = generateRandomUser();

    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');

        // # Disable LDAP
        cy.apiUpdateConfig({LdapSettings: {Enable: false}});

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T402 Finish Tutorial', () => {
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
        cy.get('#headerTeamName', {timeout: TIMEOUTS.HALF_MIN}).should('contain.text', testTeam.display_name);

        // * Check that 'Town Square' is currently being selected
        cy.get('.active').within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        // # Go through the initial tutorial
        cy.get('.NextStepsView__header-headerText').findByText('Welcome to Mattermost').should('be.visible');
        cy.get('#tutorialNextButton').should('be.visible').click();
        cy.get('#tutorialIntroTwo').findByText('How Mattermost Works:').should('be.visible');
        cy.get('#tutorialNextButton').should('be.visible').click();
        cy.get('#tutorialIntroThree').findByText('You\'re all set').should('be.visible');
        cy.get('#tutorialNextButton').should('be.visible').click();

        // # Click and complete the Message box tutorial (pulsating tooltip)
        cy.get('#tipButton').should('be.visible').click();
        cy.get('.tip-overlay--chat').within(($chatOverlay) => {
            cy.wrap($chatOverlay).contains('Sending Messages').should('be.visible');
            cy.get('#tipNextButton').should('be.visible').click();
        });

        // # Click and complete the Town Square tutorial (pulsating tooltip)
        cy.get('#tipButton').should('be.visible').click();
        cy.get('.tip-overlay--sidebar').within(($sidebarOverlay) => {
            cy.wrap($sidebarOverlay).contains(" organize conversations across different topics. They're open to everyone on your team. To send private communications use ").should('be.visible');
            cy.get('#tipNextButton').should('be.visible').click();
            cy.wrap($sidebarOverlay).contains('Here are two public channels to start:').should('be.visible');
            cy.get('#tipNextButton').should('be.visible').click();
            cy.wrap($sidebarOverlay).contains('Creating and Joining Channels').should('be.visible');
            cy.get('#tipNextButton').should('be.visible').click();
        });

        // # Click and complete the Main Menu tutorial (pulsating tooltip)
        cy.get('#tipButton').should('be.visible').click();
        cy.get('.tip-overlay--header--left').within(($headerLeftOverlay) => {
            cy.wrap($headerLeftOverlay).contains('Team administrators can also access their ').should('be.visible');
            cy.get('#tipNextButton').should('be.visible').click();
        });

        // # Reload the page without cache
        cy.reload(true);

        // * Check that 'Town Square' is currently being selected
        cy.get('.active', {timeout: TIMEOUTS.HALF_MIN}).within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        // # Assert that the tutorials do not appear
        cy.get('.NextStepsView__header-headerText').findByText('Welcome to Mattermost').should('not.exist');
    });
});
