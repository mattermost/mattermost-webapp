// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {getRandomInt} from '../../utils';
import users from '../../fixtures/users.json';

describe('Teams Suite', () => {
    it('TS12995 Cancel out of leaving a team', () => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');

        // * check the team name
        cy.get('#headerTeamName').should('contain', 'eligendi');

        // * check the initialUrl
        cy.url().should('include', '/ad-1/channels/town-square');

        // 2. open the drop down menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // 3. click the leave team
        cy.get('#sidebarDropdownMenu #leaveTeam').should('be.visible').click();

        // * Check that the "leave team modal" opened up
        cy.get('#leaveTeamModal').should('be.visible');

        // 4. click on no
        cy.get('#leaveTeamNo').click();

        // * Check that the "leave team modal" closed
        cy.get('#leaveTeamModal').should('not.be.visible');

        // * check the team name
        cy.get('#headerTeamName').should('contain', 'eligendi');

        // * check the finalUrl
        cy.url().should('include', '/ad-1/channels/town-square');
    });

    it('TS13548 Team or System Admin searches and adds new team member', () => {
        const user = users['user-1'];
        const letterCount = 3;
        const nameStartsWith = user.firstName.slice(0, letterCount);
        const maxSelectableValues = 20;
        const teamName = 'Stub team';
        const max = 9999;
        const teamURL = `stub-team-${getRandomInt(max).toString()}`;
        const townSquareURL = `/${teamURL}/channels/town-square`;
        const offTopicURL = `/${teamURL}/channels/off-topic`;

        // 1. Login as System Admin
        cy.login('sysadmin');
        cy.visit('/');

        // 2. Create team
        cy.createNewTeam(teamName, teamURL);

        // 3. Click hamburger menu > “Add Members to Team”
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#sidebarDropdownMenu #addUsersToTeam').should('be.visible').click();

        // * Check that the "add new members modal" opened up
        cy.get('#addUsersToTeamModal').should('be.visible');

        // 4. In "Add New Members To [team name] Team" modal, type the first few letters of a user who is on that server but not on the active team in the search box to filter the list
        cy.focused().type(nameStartsWith, {force: true});

        // * Verify list filters as expected
        cy.get('.filtered-user-list').should('contain', user.username);

        // 5. Select a user from the list, verify number of users who can be added decrements from 20 to 19
        cy.get('#numPeopleRemaining').should('contain', maxSelectableValues);
        cy.focused().type('{enter}');
        cy.get('#numPeopleRemaining').should('contain', maxSelectableValues - 1);

        // 6. Click Add
        cy.get('#saveItems').click();

        // * System message posts in Town Square and Off-Topic "[user2] added to the channel by [user1]"
        cy.visit(townSquareURL);
        cy.getLastPost().should('contain', 'System').and('contain', `${user.username} added to the team by you.`);
        cy.visit(offTopicURL);
        cy.getLastPost().should('contain', 'System').and('contain', `${user.username} added to the channel by you.`);

        // 7. Logout
        cy.logout();

        // 8. Login as user added to Team
        cy.login(user.username);

        // * The added user sees the new team added to the team sidebar
        cy.get(`#${teamURL}TeamButton`).should('have.attr', 'href').should('contain', teamURL);

        // * System message posts in Town Square and Off-Topic "[user2] added to the channel by [user1]"
        cy.visit(townSquareURL);
        cy.getLastPost().should('contain', 'System').and('contain', 'You were added to the team by @sysadmin.');
        cy.visit(offTopicURL);
        cy.getLastPost().should('contain', 'System').and('contain', 'You were added to the channel by @sysadmin.');

        // 9. Remove user from team
        cy.removeTeamMember(teamURL, user.firstName);
    });
});
