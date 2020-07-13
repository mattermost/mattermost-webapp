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

    it('TS13872 Create a team', () => {
        // # Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').click();

        // * Dropdown menu should be visible
        cy.get('#sidebarDropdownMenu').should('exist').within(() => {
            // # Click "Create a Team"
            cy.findByText('Create a Team').should('be.visible').click();
        });

        // # Input team name as Team Test
        cy.get('#teamNameInput').should('be.visible').type('Team Test');

        // # Click Next button
        cy.get('#teamNameNextButton').should('be.visible').click();

        // # Input team URL as variable teamURl
        const teamURL = `team-${getRandomId()}`;
        cy.get('#teamURLInput').should('be.visible').type(teamURL);

        // # Click finish button
        cy.get('#teamURLFinishButton').should('be.visible').click();

        // * Should redirect ot Town Square channel
        cy.get('#channelHeaderTitle').should('contain', 'Town Square');

        // * check url is correct
        cy.url().should('include', teamURL + '/channels/town-square');

        // * Team name should displays correctly at top of LHS
        cy.get('#headerTeamName').should('contain', 'Team Test');
    });
});
