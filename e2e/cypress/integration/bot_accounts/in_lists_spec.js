// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @bot_accounts

import {zip, orderBy} from 'lodash';

import {createBotPatch} from '../../support/api/bots';

const STATUS_PRIORITY = {
    online: 0,
    away: 1,
    dnd: 2,
    offline: 3,
    ooo: 3,
};

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
            // # Create 3 bots and add to current team and channel
            bots = await Promise.all([
                createBotPatch(),
                createBotPatch(),
                createBotPatch(),
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
        cy.makeClient().then(async (client) => {
            // # Go to system console > users
            cy.visit('/admin_console/user_management/users');

            const {total_users_count: nonBotCount} = await client.getFilteredUsersStats({include_bots: false});

            bots.forEach(({username}) => {
                // # Search for bot
                cy.get('#searchUsers').clear().type(`@${username}`);

                // * Verify bot not in list
                cy.findByTestId('noUsersFound').should('have.text', 'No users found');

                // * Verify pseudo checksum total of non bot users
                cy.get('#searchableUserListTotal').should('have.text', `0 users of ${nonBotCount} total`);
            });
        });
    });

    it('MM-T1835 Channel Members list for BOTs', () => {
        cy.makeClient().then((client) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);

            // # Open channel members
            cy.get('button.member-popover__trigger').click();

            cy.get('#member-list-popover .more-modal__row .more-modal__name').then(async ($query) => {
                // # Escape jQuery
                const userEls = $query.toArray();

                // # Get users
                const profiles = await client.getProfilesByUsernames(userEls.map(({innerText}) => innerText));
                const statuses = await client.getStatusesByIds(profiles.map((user) => user.id));
                const users = zip(profiles, statuses).map(([profile, status]) => ({...profile, ...status}));

                // # Sort 'em
                const sortedUsers = orderBy(users, [
                    ({is_bot: isBot}) => isBot,
                    ({status}) => STATUS_PRIORITY[status],
                    ({username}) => username,
                ], [
                    'desc',
                    'asc',
                    'asc',
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
