// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @bot_accounts

import {zip, sortBy} from 'lodash';

import {createBotPatch} from '../../support/api/bots';

describe('Bots in lists', () => {
    let team;
    let channel;
    let bots;

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
            bots = await Promise.all([
                createBotPatch('bota'),
                createBotPatch('botc'),
                createBotPatch('botb'),
            ].map(async (botPatch) => {
                const bot = await client.createBot(botPatch);
                await client.addToTeam(team.id, bot.user_id);
                await client.addToChannel(bot.user_id, channel.id);
                cy.wrap(bot.username).should('not.be.undefined');
                return bot;
            }));
        });
    });

    it('MM-T1834 Bots are not listed on “Users” list in System Console > Users', () => {
        // # Go to system console > users
        cy.visit('/admin_console/user_management/users');

        // # Search for user
        cy.get('#searchUsers').type(`@${bots[0].username}`);

        // * Verify bot not included
        cy.findByTestId('noUsersFound').should('have.text', 'No users found');
    });

    it('MM-T1835 Channel Members list for BOTs', () => {
        cy.makeClient().then((client) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);

            // # Open channel members
            cy.get('button.member-popover__trigger').click();

            cy.get('#member-list-popover .more-modal__row .more-modal__name').then(async ($query) => {
                // # Escape jQuery
                const userEls = $query.toArray();

                // # Get 'em (users: profiles and statuses)
                const profiles = await client.getProfilesByUsernames(userEls.map(({innerText}) => innerText));
                const statuses = await client.getStatusesByIds(profiles.map((user) => user.id));
                const users = zip(profiles, statuses).map(([profile, status]) => ({...profile, ...status}));

                // # Sort 'em
                const sortedUsers = sortBy(users, [
                    ({is_bot: isBot}) => (isBot ? 1 : 0),
                    ({status}) => STATUS_PRIORITY[status],
                    ({username}) => username,
                ]);

                // * Verify order of member-dropdown users against data-sorted version
                cy.wrap(userEls.map(({innerText}) => innerText)).
                    should('deep.equal', sortedUsers.map(({username}) => username));
            });

            // * Verify no statuses on bots
            cy.get('#member-list-popover .more-modal__row--bot .status-wrapper .status').should('not.exist');

            // * Verify bot badges
            cy.get('#member-list-popover .more-modal__row--bot .Badge').each(($badge) => {
                cy.wrap($badge).should('be.visible').and('have.text', 'BOT');
            });
        });
    });
});

const STATUS_PRIORITY = {
    online: 0,
    away: 1,
    dnd: 2,
    offline: 3,
    ooo: 3,
};
