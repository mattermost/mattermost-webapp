// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @team_settings @smoke

import {getRandomId} from '../../utils';

describe('Teams Suite', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T383 Create a new team', () => {
        // # Open the team creation modal from the hamburger menu
        openTeamCreationModalFromHamburgerMenu();

        // # Input team name as Team Test
        cy.get('#teamNameInput').should('be.visible').type('Team Test');

        // # Click Next button
        cy.get('#teamNameNextButton').should('be.visible').click();

        // # Input team URL as variable teamURl
        const teamURL = `team-${getRandomId()}`;
        cy.get('#teamURLInput').should('be.visible').type(teamURL);

        // # Click finish button
        cy.get('#teamURLFinishButton').should('be.visible').click();

        // * Should redirect to Town Square channel
        cy.get('#channelHeaderTitle').should('contain', 'Town Square');

        // * check url is correct
        cy.url().should('include', teamURL + '/channels/town-square');

        // * Team name should displays correctly at top of LHS
        cy.get('#headerTeamName').should('contain', 'Team Test');
    });

    it('MM-T1437 Try to create a new team using restricted words', () => {
        // * Enter different reserved words and verify the error message
        tryReservedTeamURLAndVerifyError('plugins');
        tryReservedTeamURLAndVerifyError('login');
        tryReservedTeamURLAndVerifyError('admin');
        tryReservedTeamURLAndVerifyError('channel');
        tryReservedTeamURLAndVerifyError('post');
        tryReservedTeamURLAndVerifyError('api');
        tryReservedTeamURLAndVerifyError('oauth');
        tryReservedTeamURLAndVerifyError('error');
        tryReservedTeamURLAndVerifyError('help');
    });
});

function openTeamCreationModalFromHamburgerMenu() {
    // # Click hamburger main menu
    cy.get('#sidebarHeaderDropdownButton').click();

    // * Dropdown menu should be visible
    cy.get('#sidebarDropdownMenu').should('exist').within(() => {
        // # Click "Create a Team"
        cy.findByText('Create a Team').should('be.visible').click();
    });
}

function tryReservedTeamURLAndVerifyError(teamURL) {
    // # Open the team creation modal from the hamburger menu
    openTeamCreationModalFromHamburgerMenu();

    // # Input passed in team name
    cy.get('#teamNameInput').should('be.visible').type(teamURL);

    // # Click Next button
    cy.findByText('Next').should('be.visible').click();

    // # Input a passed in value of the team url
    cy.get('#teamURLInput').should('be.visible').clear().type(teamURL);

    // # Hit finish button
    cy.findByText('Finish').should('exist').click();

    // * Verify that we get error message for reserved team url
    cy.get('form').within(() => {
        // # Split search into multiple lines as text contains links and new lines
        cy.findByText(/This URL\s/).should('exist');
        cy.findByText(/starts with a reserved word/).should('exist');
        cy.findByText(/\sor is unavailable. Please try another./).should('exist');
    });

    // # Close the modal
    cy.findByText('Back').click();
}
