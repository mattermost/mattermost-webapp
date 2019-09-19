// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomInt} from '../../utils';

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Teams Suite', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('TS13872 Create a team', async () => {
        const teamURL = `team-test-${getRandomInt(9999).toString()}`;

        // # Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').click();

        // * Dropdown menu should be visible
        cy.get('#sidebarDropdownMenu').should('be.visible');

        // # Click "Create a New Team"
        cy.get('#createTeam').click();

        // # Input team name as Team Test
        cy.get('#teamNameInput').should('be.visible').type('Team Test');

        // # Click Next button
        cy.get('#teamNameNextButton').should('be.visible').click();

        // # Input team URL as variable teamURl
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
