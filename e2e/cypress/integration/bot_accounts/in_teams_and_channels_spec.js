// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @bot_accounts

import {generateRandomBot} from '../../support/api/bots';
import {createTeamPatch} from '../../support/api/team';

describe('Managing bots in Teams', () => {
    before(() => {
        // # Set ServiceSettings to expected values
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableBotAccountCreation: true,
            },
        });

        cy.apiInitSetup();
    });

    it('MM-T1814 Add a BOT to a team', () => {
        // # Create a bot and get bot user id
        cy.makeClient().then(async (client) => {
            const bot = await client.createBot(generateRandomBot());
            const team = await client.createTeam(createTeamPatch());
            const channel = await client.getChannelByName(team.id, 'town-square');

            cy.visit(`/${team.name}/channels/${channel.name}`);

            // # Open invite screen
            cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
            cy.get('#invitePeople > button').should('contain.text', 'Invite People').click();
            cy.findByTestId('inviteMembersSection').should('contain.text', 'Invite Members').click();

            // # Enter bot username and submit
            cy.findByTestId('inputPlaceholder').find('input').type(bot.username, {force: true}).as('input');
            cy.get('.users-emails-input__option ').contains(`@${bot.username}`);
            cy.get('@input').type('{enter}', {force: true});
            cy.get('.invite-members button').click();

            // * Verify bot added to team
            cy.get('.invitation-modal-confirm-sent .InvitationModalConfirmStepRow').
                should('contain.text', `@${bot.username} - ${bot.display_name}`).
                and('contain.text', 'This member has been added to the team.');

            // * Verify system message
            cy.get('.confirm-done').click();
            cy.uiGetNthPost(-1).should('contain.text', `@${bot.username} added to the team by you.`);
        });
    });
});
