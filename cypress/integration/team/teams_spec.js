// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

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

    it('Cancel out of leaving a team', () => {
        // * check the team name
        cy.get('#headerTeamName').should('contain', 'eligendi');

        // 2. open the drop down menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // 3. click the leave team
        cy.get('#sidebarDropdownMenu #leaveTeam').should('be.visible').click();

        // 4. click on no
        cy.get('.modal-content .modal-footer .btn-default').should('be.visible');
        cy.get('.modal-content .modal-footer .btn-default').should('contain', 'No');
        cy.get('.modal-content .modal-footer .btn-default').click();

        // * check the team name
        cy.get('#headerTeamName').should('contain', 'eligendi');
    });
});