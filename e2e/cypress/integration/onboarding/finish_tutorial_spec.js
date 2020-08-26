
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @onboarding

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getEmailUrl, getEmailMessageSeparator, reUrl, getRandomId} from '../../utils';

describe('Onboarding', () => {
    let testTeam;
    const randomId = getRandomId();
    const username = `user${randomId}`;
    const email = `user${randomId}@sample.mattermost.com`;
    const password = 'passwd';

    const baseUrl = Cypress.config('baseUrl');
    const mailUrl = getEmailUrl(baseUrl);

    before(() => {
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
        cy.get('#headerTeamName').should('contain.text', testTeam.display_name);

        // * Check that 'Town Square' is currently being selected
        cy.get('.active').within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        // * Check that the 'Welcome to: Mattermost' message is visible
        cy.get('#tutorialIntroOne').findByText('Welcome to:').should('be.visible');
        cy.get('#tutorialIntroOne').findByText('Mattermost').should('be.visible');

        cy.get('#tutorialNextButton').should('be.visible').click();

        cy.get('#tutorialIntroTwo').findByText('How Mattermost Works:').should('be.visible');
        cy.get('#tutorialNextButton').should('be.visible').click();

        cy.get('#tutorialIntroThree').findByText('You\'re all set').should('be.visible');
        cy.get('#tutorialNextButton').should('be.visible').click();

        cy.get('#tipButton').should('be.visible').click();
        cy.findByText('Sending Messages').should('be.visible');

        cy.get('#tipNextButton').should('be.visible').click();

        cy.get('#tipButton').should('be.visible').click();
        cy.get('.tip-overlay--sidebar').should('be.visible').within(() => {
            cy.findByText('organize conversations across different topics.', {exact: false}).should('be.visible');

            // cy.get('#tipNextButton').should('be.visible').click();
            // cy.get('div').eq(1).find('h4').eq(0).should('have.text', '"Town Square" and "Off-Topic" channels').abd('be.visible');
            // cy.get('#tipNextButton').should('be.visible').click();
            // cy.get('div').eq(1).find('h4').eq(0).should('have.text', 'Creating and Joining Channels').and('be.visible');
            // cy.get('#tipNextButton').should('be.visible').click();
        });
    });
});
