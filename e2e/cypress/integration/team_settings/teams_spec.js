// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @team_settings

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
        cy.visit('/ad-1/channels/town-square');

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
        // # Login as sysadmin and update config
        cy.apiLogin('sysadmin');
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: false,
            },
        });

        const user1 = users['user-1'];
        const sysadmin = users.sysadmin;
        const letterCount = 3;
        const nameStartsWith = user1.firstName.slice(0, letterCount);
        const teamName = 'Stub team';
        const max = 9999;
        const teamURL = `stub-team-${getRandomInt(max).toString()}`;

        // # Login as System Admin, update teammate name display preference to "username" and visit "/"
        cy.apiLogin(sysadmin.username);
        cy.apiSaveTeammateNameDisplayPreference('username');
        cy.visit('/ad-1/channels/town-square');

        // # Create team
        cy.createNewTeam(teamName, teamURL);

        // # Click hamburger menu > Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').and('contain', 'Invite People').
            find('.MenuItem__help-text').should('have.text', 'Add or invite people to the team');

        cy.get('#invitePeople').click();

        // * Check that the Invitation Modal opened up
        cy.findByTestId('invitationModal', {timeout: TIMEOUTS.TINY}).should('be.visible');

        cy.findByTestId('inputPlaceholder').should('be.visible').within(($el) => {
            // # Type the first letters of a user
            cy.wrap($el).get('input').type(nameStartsWith, {force: true});

            // * Verify user is on the list, then select by clicking on it
            cy.wrap($el).get('.users-emails-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', `@${user1.username}`).and('contain', `${user1.firstName} ${user1.lastName}`).
                click();
        });

        // # Click "Invite Members" button, then "Done" button
        cy.findByText(/Invite Members/).should('be.visible').click();
        cy.findByText(/Done/).should('be.visible').click();

        // * As sysadmin, verify system message posts in Town Square and Off-Topic
        cy.getLastPost().wait(TIMEOUTS.TINY).then(($el) => {
            cy.wrap($el).get('.user-popover').
                should('be.visible').
                and('have.text', 'System');
            cy.wrap($el).get('.post-message__text-container').
                should('be.visible').
                and('contain', 'You joined the team.').
                and('contain', `@${user1.username} added to the team by you.`);
        });

        cy.get('#sidebarItem_off-topic').should('be.visible').click({force: true});
        cy.getLastPost().wait(TIMEOUTS.TINY).then(($el) => {
            cy.wrap($el).get('.user-popover').
                should('be.visible').
                and('have.text', 'System');
            cy.wrap($el).get('.post-message__text-container').
                should('be.visible').
                and('contain', 'You joined the channel.').
                and('contain', `@${user1.username} added to the channel by you.`);
        });

        // # Login as user added to Team, update teammate name display preference to "username" and reload
        cy.apiLogin(user1.username);
        cy.apiSaveTeammateNameDisplayPreference('username');
        cy.reload();

        // # Visit the new team and verify that it's in the correct team view
        cy.visit(`/${teamURL}/channels/town-square`);
        cy.get(`#${teamURL}TeamButton`).should('have.attr', 'href').and('contain', teamURL);

        // * As user-1, verify system message posts in Town Square and Off-Topic
        cy.getLastPost().wait(TIMEOUTS.TINY).then(($el) => {
            cy.wrap($el).get('.user-popover').
                should('be.visible').
                and('have.text', 'System');
            cy.wrap($el).get('.post-message__text-container').
                should('be.visible').
                and('contain', `@${sysadmin.username} joined the team.`).
                and('contain', `You were added to the team by @${sysadmin.username}.`);
        });

        cy.get('#sidebarItem_off-topic').should('be.visible').click({force: true});
        cy.getLastPost().wait(TIMEOUTS.TINY).then(($el) => {
            cy.wrap($el).get('.user-popover').
                should('be.visible').
                and('have.text', 'System');
            cy.wrap($el).get('.post-message__text-container').
                should('be.visible').
                and('contain', `@${sysadmin.username} joined the channel.`).
                and('contain', `You were added to the channel by @${sysadmin.username}.`);
        });

        // # Remove user from team
        removeTeamMember(teamURL, user1.username);
    });

    it('TS14633 Leave all teams', () => {
        cy.apiUpdateConfig({EmailSettings: {RequireEmailVerification: false}});

        // # Login as new user
        cy.apiCreateAndLoginAsNewUser();

        // # Leave all teams
        cy.apiGetTeams().then((response) => {
            response.body.forEach((team) => {
                cy.visit(`/${team.name}/channels/town-square`);
                cy.get('#headerTeamName').should('be.visible').and('have.text', team.display_name);
                cy.leaveTeam();
            });
        });

        // * Check that it redirects into team selection page after leaving all teams
        cy.url().should('include', '/select_team');

        // # Check that logout is visible and then click to logout
        cy.get('#logout').should('be.visible').click();

        // * Ensure user is logged out
        cy.url({timeout: TIMEOUTS.LARGE}).should('include', 'login');
    });
});
