// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @team_settings

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getAdminAccount} from '../../support/env';

function removeTeamMember(teamName, username) {
    cy.apiAdminLogin();
    cy.visit(`/${teamName}`);
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#manageMembers').click();
    cy.get(`#teamMembersDropdown_${username}`).should('be.visible').click();
    cy.get('#removeFromTeam').should('be.visible').click();
    cy.get('.modal-header .close').click();
}

describe('Teams Suite', () => {
    let testTeam;
    let testUser;

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;
        });
    });

    it('MM-T393 Cancel out of leaving team', () => {
        // # Login and go to /
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // * check the team name
        cy.get('#headerTeamName').should('contain', testTeam.display_name);

        // * check the initialUrl
        cy.url().should('include', `/${testTeam.name}/channels/town-square`);

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
        cy.get('#headerTeamName').should('contain', testTeam.display_name);

        // * check the finalUrl
        cy.url().should('include', `/${testTeam.name}/channels/town-square`);
    });

    it('MM-T2340 Team or System Admin searches and adds new team member', () => {
        // # Update config
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: false,
            },
        });

        let otherUser;
        cy.apiCreateUser().then(({user}) => {
            otherUser = user;

            cy.visit(`/${testTeam.name}/channels/town-square`);

            // # Click hamburger menu > Invite People
            cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
            cy.get('#invitePeople').should('be.visible').and('contain', 'Invite People').
                find('.MenuItem__help-text').should('have.text', 'Add or invite people to the team');

            cy.get('#invitePeople').click();

            // * Check that the Invitation Modal opened up
            cy.findByTestId('invitationModal', {timeout: TIMEOUTS.HALF_SEC}).should('be.visible');

            cy.findByTestId('inputPlaceholder').should('be.visible').within(($el) => {
                // # Type the first letters of a user
                cy.wrap($el).get('input').type(otherUser.first_name, {force: true});

                // * Verify user is on the list, then select by clicking on it
                cy.wrap($el).get('.users-emails-input__menu').
                    children().should('have.length', 1).
                    eq(0).should('contain', `@${otherUser.username}`).and('contain', `${otherUser.first_name} ${otherUser.last_name}`).
                    click();
            });

            // # Click "Invite Members" button, then "Done" button
            cy.findByText(/Invite Members/).should('be.visible').click();
            cy.findByText(/Done/).should('be.visible').click();

            // * As sysadmin, verify system message posts in Town Square and Off-Topic
            cy.getLastPost().wait(TIMEOUTS.HALF_SEC).then(($el) => {
                cy.wrap($el).get('.user-popover').
                    should('be.visible').
                    and('have.text', 'System');
                cy.wrap($el).get('.post-message__text-container').
                    should('be.visible').
                    and('contain', `You and @${testUser.username} joined the team.`).
                    and('contain', `@${otherUser.username} added to the team by you.`);
            });

            cy.get('#sidebarItem_off-topic').should('be.visible').click({force: true});
            cy.getLastPost().wait(TIMEOUTS.HALF_SEC).then(($el) => {
                cy.wrap($el).get('.user-popover').
                    should('be.visible').
                    and('have.text', 'System');
                cy.wrap($el).get('.post-message__text-container').
                    should('be.visible').
                    and('contain', `You and @${testUser.username} joined the channel.`).
                    and('contain', `@${otherUser.username} added to the channel by you.`);
            });

            // # Login as user added to Team and reload
            cy.apiLogin(otherUser);

            // # Visit the new team and verify that it's in the correct team view
            cy.visit(`/${testTeam.name}/channels/town-square`);
            cy.get('#headerTeamName').should('contain', testTeam.display_name);

            const sysadmin = getAdminAccount();

            // * As other user, verify system message posts in Town Square and Off-Topic
            cy.getLastPost().wait(TIMEOUTS.HALF_SEC).then(($el) => {
                cy.wrap($el).get('.user-popover').
                    should('be.visible').
                    and('have.text', 'System');
                cy.wrap($el).get('.post-message__text-container').
                    should('be.visible').
                    and('contain', `@${sysadmin.username} joined the team.`).
                    and('contain', `You were added to the team by @${sysadmin.username}.`);
            });

            cy.get('#sidebarItem_off-topic').should('be.visible').click({force: true});
            cy.getLastPost().wait(TIMEOUTS.HALF_SEC).then(($el) => {
                cy.wrap($el).get('.user-popover').
                    should('be.visible').
                    and('have.text', 'System');
                cy.wrap($el).get('.post-message__text-container').
                    should('be.visible').
                    and('contain', `@${sysadmin.username} joined the channel.`).
                    and('contain', `You were added to the channel by @${sysadmin.username}.`);
            });

            // # Remove user from team
            removeTeamMember(testTeam.name, otherUser.username);
        });
    });

    it('MM-T394 Leave team by clicking Yes, leave all teams', () => {
        cy.apiUpdateConfig({EmailSettings: {RequireEmailVerification: false}});

        // // # Login as test user
        cy.apiLogin(testUser);

        // # Leave all teams
        cy.apiGetTeamsForUser().then(({teams}) => {
            teams.forEach((team) => {
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
        cy.url({timeout: TIMEOUTS.HALF_MIN}).should('include', 'login');
    });

    it('MM-T1535 Team setting / Invite code text', () => {
        // # visit /
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Open the hamburger menu
        cy.findByLabelText('main menu').should('be.visible').click();

        // # Click on team settings menu item
        cy.findByText('Team Settings').should('be.visible').click();

        // # Open edit settings for invite code
        cy.findByText('Invite Code').should('be.visible').click();

        // * Verify invite code help text is visible
        cy.findByText('The Invite Code is part of the unique team invitation link which is sent to members you’re inviting to this team. Regenerating the code creates a new invitation link and invalidates the previous link.').
            scrollIntoView().
            should('be.visible');

        // # Close the team settings
        cy.get('body').type('{esc}', {force: true});
    });
});
