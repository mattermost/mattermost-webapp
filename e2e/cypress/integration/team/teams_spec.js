// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {getRandomInt} from '../../utils';
import users from '../../fixtures/users.json';
import * as TIMEOUTS from '../../fixtures/timeouts';

function removeTeamMember(teamURL, username) {
    cy.apiLogout();
    cy.apiLogin('sysadmin');
    cy.visit(`/${teamURL}`);
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#manageMembers').click();
    cy.get(`#teamMembersDropdown_${username}`).should('be.visible').click();
    cy.get('#removeFromTeam').should('be.visible').click();
    cy.get('.modal-header .close').click();
}

describe('Teams Suite', () => {
    it('TS12995 Cancel out of leaving a team', () => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // * check the team name
        cy.get('#headerTeamName').should('contain', 'eligendi');

        // * check the initialUrl
        cy.url().should('include', '/ad-1/channels/town-square');

        // # open the drop down menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // # click the leave team
        cy.get('#sidebarDropdownMenu #leaveTeam').should('be.visible').click();

        // * Check that the "leave team modal" opened up
        cy.get('#leaveTeamModal').should('be.visible');

        // # click on no
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
        const teamName = 'Stub team';
        const max = 9999;
        const teamURL = `stub-team-${getRandomInt(max).toString()}`;
        const townSquareURL = `/${teamURL}/channels/town-square`;
        const offTopicURL = `/${teamURL}/channels/off-topic`;

        // # Login as System Admin, update teammate name display preference to "username" and visit "/"
        cy.apiLogin('sysadmin');
        cy.apiSaveTeammateNameDisplayPreference('username');
        cy.visit('/');

        // # Create team
        cy.createNewTeam(teamName, teamURL);

        // # Click hamburger menu > Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').and('have.text', 'Invite People').click();

        // * Check that the Invitation Modal opened up
        cy.getByTestId('invitationModal', {timeout: TIMEOUTS.TINY}).should('be.visible');

        cy.getByTestId('inputPlaceholder').should('be.visible').within(($el) => {
            // # Type the first letters of a user
            cy.wrap($el).get('input').type(nameStartsWith, {force: true});

            // * Verify user is on the list, then select by clicking on it
            cy.wrap($el).get('.users-emails-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', `@${user.username}`).and('contain', `${user.firstName} ${user.lastName}`).
                click();
        });

        // # Click Invite Members
        cy.getByText(/Invite Members/).click();

        // * System message posts in Town Square and Off-Topic "[user2] added to the channel by [user1]"
        cy.visit(townSquareURL);
        cy.getLastPost().should('contain', 'System').and('contain', `${user.username} added to the team by you.`);
        cy.visit(offTopicURL);
        cy.getLastPost().should('contain', 'System').and('contain', `${user.username} added to the channel by you.`);

        // # Login as user added to Team, update teammate name display preference to "username" and reload
        cy.apiLogin(user.username);
        cy.apiSaveTeammateNameDisplayPreference('username');
        cy.reload();

        // * The added user sees the new team added to the team sidebar
        cy.get(`#${teamURL}TeamButton`).should('have.attr', 'href').should('contain', teamURL);

        // * System message posts in Town Square and Off-Topic "[user2] added to the channel by [user1]"
        cy.visit(townSquareURL);
        cy.getLastPost().should('contain', 'System').and('contain', 'You were added to the team by @sysadmin.');
        cy.visit(offTopicURL);
        cy.getLastPost().should('contain', 'System').and('contain', 'You were added to the channel by @sysadmin.');

        // # Remove user from team
        removeTeamMember(teamURL, user.username);
    });

    it('TS14633 Leave all teams', () => {
        cy.apiUpdateConfig({EmailSettings: {RequireEmailVerification: false}});

        // # Login as new user
        cy.loginAsNewUser();

        // # Leave all teams
        function leaveAllTeams() {
            cy.apiGetTeams().then((response) => {
                if (response.body.length > 0) {
                    cy.leaveTeam().then(() => leaveAllTeams());
                }
            });
        }

        leaveAllTeams();

        // * Check that it redirects into team selection page after leaving all teams
        cy.url().should('include', '/select_team');

        // # Check that logout is visible and then click to logout
        cy.get('#logout').should('be.visible').click();

        // * Ensure user is logged out
        cy.url({timeout: TIMEOUTS.LARGE}).should('include', 'login');
    });
});
