// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @bot_accounts

import {createBotPatch} from '../../support/api/bots';

describe('Bot visibility in lists', () => {
    let me;
    let team;
    let channel;
    let postId;

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableBotAccountCreation: true,
            },
        });
        cy.apiInitSetup().then((out) => {
            team = out.team;
            channel = out.channel;
        });

        cy.makeClient().then(async (client) => {
            // # Setup state
            const bot = await client.createBot(createBotPatch());
            await client.addToTeam(team.id, bot.user_id);
            await client.addToChannel(bot.user_id, channel.id);
        });
    });

    it('MM-T1831 BOT tag is visible in search results', () => {

    });
});
