// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Group Synced Team - Bot invitation flow', () => {
    let groupConstrainedTeam;
    let bot;

    before(() => {
        // # Login as sysadmin to perform setup
        cy.apiLogin('sysadmin');

        // # Get the first group constrained team available on the server
        cy.apiGetAllTeams().then((response) => {
            response.body.forEach((team) => {
                if (team.group_constrained && !groupConstrainedTeam) {
                    groupConstrainedTeam = team;
                }
            });
        });

        // # Get the first bot on the server
        cy.apiGetBots().then((response) => {
            bot = response.body[0];
        });
    });

    it('MM-21793 Invite and remove a bot within a group synced team', async () => {
        if (!groupConstrainedTeam || !bot) {
            return;
        }

        // # Login as an LDAP Group synced user
        cy.apiLogin('test.one', 'Password1');

        // # Visit the group constrained team
        cy.visit(`/${groupConstrainedTeam.name}`);

        // # Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // # Click invite people
        cy.get('#invitePeople').should('be.visible').click();

        cy.findByTestId('inputPlaceholder').should('be.visible').within(() => {
            // # Type the first letters of a bot
            cy.get('input').type(bot.username, {force: true});

            // * Verify user is on the list, then select by clicking on it
            cy.get('.users-emails-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', `@${bot.username}`).
                click();
        });

        // # Invite the bot
        cy.get('#inviteMembersButton').click();

        // * Ensure that the response messsage was not an error
        cy.get('.InvitationModalConfirmStepRow').find('.reason').should('not.contain', 'Error');

        // # Visit the group constrained team
        cy.visit(`/${groupConstrainedTeam.name}`);

        // # Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // # Open the manage members modal
        cy.get('#manageMembers').should('be.visible').click();

        // # Search for the bot that we want to remove
        cy.get('#searchUsersInput').should('be.visible').type(bot.username);

        cy.get(`#teamMembersDropdown_${bot.username}`).should('be.visible').then((el) => {
            // # Have to use a jquery click here instead of a cypress click due to in order for the dropdown menu to stay open
            el.click();

            // * Ensure that we have the ability to remove the bot and click the dropdown option
            cy.get('#removeFromTeam').should('be.visible').click();
        });

        // * Ensure that the bot is no longer there
        cy.findByTestId('noUsersFound').should('be.visible');
    });
});
