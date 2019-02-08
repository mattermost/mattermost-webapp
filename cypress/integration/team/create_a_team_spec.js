// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomInt} from '../../utils';

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Teams Suite', () => {
    before(() => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');
    });

    it('Create a team', async () => {
        const teamURL = `team-test-${getRandomInt(9999).toString()}`;

        //  Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').click();

        // dropdown menu should be visible then click create team
        cy.get('#createTeam').should('be.visible').click();

        // input team name as Team Test
        cy.get('#teamNameInput').should('be.visible').type('Team Test');

        // click next
        cy.get('#teamNameNextButton').should('be.visible').click();

        // input team url as team-test-e2e
        cy.get('#teamURLInput').should('be.visible').type(teamURL);

        // click finish
        cy.get('#teamURLFinishButton').should('be.visible').click();

        // should redirect ot Town Square channel
        cy.get('#channelHeaderTitle').should('contain', 'Town Square');

        // check url is correct
        cy.url().should('include', teamURL + '/channels/town-square');

        // Team name should displays correctly at top of LHS
        cy.get('#headerTeamName').should('contain', 'Team Test');
    });
});
