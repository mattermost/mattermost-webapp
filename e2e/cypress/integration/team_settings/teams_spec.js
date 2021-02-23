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
    let newUser;

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.apiCreateUser().then(({user}) => {
            newUser = user;
        });
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

    it('MM-T2312 Team setting / Team name: Change name', () => {
        const teamName = 'Test Team';

        // # Visit town-square channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Open the hamburger menu
        cy.findByLabelText('main menu').should('be.visible').click();

        // # Click on team settings menu item
        cy.findByText('Team Settings').should('be.visible').click();

        // # Click on the team name menu item
        cy.findByText('Team Name').should('be.visible').click();

        // # Change team name in the input
        cy.get('#teamName').should('be.visible').clear().type(teamName);

        // Save new team name
        cy.findByText(/save/i).click();

        // # Close the team settings
        cy.get('body').type('{esc}', {force: true});

        // Team display name shows as "Testing Team" at top of main menu
        cy.get('#headerTeamName').invoke('text').should('eq', teamName);

        // Team initials show in the team icon in the sidebar
        cy.get(`#${testTeam.name}TeamButton`).scrollIntoView().should('have.attr', 'aria-label', 'test team team');

        // # Verify url has original team name
        cy.url().should('include', `/${testTeam.name}/channels/town-square`);
    });

    it('MM-T2317 Team setting / Update team description', () => {
        const teamDescription = 'This is the best team';

        // # Visit town-square channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Open the hamburger menu
        cy.findByLabelText('main menu').should('be.visible').click();

        // # Click on team settings menu item
        cy.findByText('Team Settings').should('be.visible').click();

        // # Click on the team description menu item
        cy.findByText('Team Description').should('be.visible').click();

        // # Change team description in the input
        cy.get('#teamDescription').should('be.visible').clear().type(teamDescription);
        cy.get('#teamDescription').should('have.value', teamDescription);

        // Save new team description
        cy.findByText(/save/i).click();

        // # Close the team settings
        cy.get('body').type('{esc}', {force: true});

        // Team tooltip should show description
        verifyToolTip('#headerTeamName', teamDescription);
    });

    it('MM-T2318 Allow anyone to join this team', () => {
        // # Visit town-square channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Open the hamburger menu
        cy.findByLabelText('main menu').should('be.visible').click();

        // # Click on team settings menu item
        cy.findByText('Team Settings').should('be.visible').click();

        // # Click on the team description menu item
        cy.findByText('Allow any user with an account on this server to join this team').should('be.visible').click();

        // # Change team description in the input
        cy.get('#teamOpenInvite').click();

        // Save new team description
        cy.findByText(/save/i).click();

        // # Close the team settings
        cy.get('body').type('{esc}', {force: true});

        // # Login as new user
        cy.apiLogin(newUser);
        cy.visit('/');

        // * Verify if the user is redirected to the Select Team page
        cy.url().should('include', '/select_team');
        cy.get('#teamsYouCanJoinContent').should('be.visible');

        // # Select test team name
        cy.findByText(testTeam.display_name, {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').click();

        // # Verify Town square is visible
        cy.url().should('include', `/${testTeam.name}/channels/town-square`);
        cy.findByText('Beginning of Town Square').should('be.visible');
    });

    it('MM-T2322 Do not allow anyone to join this team', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Open the hamburger menu
        cy.findByLabelText('main menu').should('be.visible').click();

        // # Click on team settings menu item
        cy.findByText('Team Settings').should('be.visible').click();

        // # Click on the team description menu item
        cy.findByText('Allow any user with an account on this server to join this team').should('be.visible').click();

        // # Change team description in the input
        cy.get('#teamOpenInviteNo').click();

        // Save new team description
        cy.findByText(/save/i).click();

        // # Close the team settings
        cy.get('body').type('{esc}', {force: true});

        // # Login as new user
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Open the hamburger menu
        cy.findByLabelText('main menu').should('be.visible').click();

        // # Click on Join another team menu item
        cy.findByText('Join Another Team').should('be.visible').click();

        // # Verify the original test team isn't on the lit
        cy.get('.signup-team-dir').children().should('not.contain', `#${testTeam.name.charAt(0).toUpperCase() + testTeam.name.slice(1)}`);
    });

    it('MM-T2328 Member can view and search for members', () => {
        cy.apiLogout();
        cy.wait(TIMEOUTS.ONE_SEC);

        // * Login as test user and join town square
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Open the hamburger menu
        cy.findByLabelText('main menu').should('be.visible').click();

        // # Click on Join another team menu item
        cy.findByText('View Members').should('be.visible').click();
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('#searchUsersInput').type('sysadmin');
        cy.get('.more-modal__list').should('be.visible').children().should('have.length', 1);
    });

    function verifyToolTip(targetElement, label) {
        cy.get(targetElement).trigger('mouseover', {force: true});
        cy.findByText(label).should('be.visible');

        cy.get(targetElement).trigger('mouseout', {force: true});
        cy.findByText(label).should('not.be.visible');
    }
});
