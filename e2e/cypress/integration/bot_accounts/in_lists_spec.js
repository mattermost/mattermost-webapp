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
import {generateRandomUser} from '../../support/api/user';

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
    let createdUsers;

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
            // # Create bots
            bots = await Promise.all([
                client.createBot(createBotPatch()),
                client.createBot(createBotPatch()),
                client.createBot(createBotPatch()),
            ]);

            // # Create users
            createdUsers = await Promise.all([
                client.createUser(generateRandomUser()),
                client.createUser(generateRandomUser()),
            ]);

            await Promise.all([
                ...bots,
                ...createdUsers,
            ].map(async (user) => {
                // * Verify username exists
                cy.wrap(user).its('username');

                // # Add to team and channel
                await client.addToTeam(team.id, user.user_id ?? user.id);
                await client.addToChannel(user.user_id ?? user.id, channel.id);
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
                // # Extract usernames from jQuery collection
                const usernames = $query.toArray().map(({innerText}) => innerText);

                // # Get users
                const profiles = await client.getProfilesByUsernames(usernames);
                const statuses = await client.getStatusesByIds(profiles.map((user) => user.id));
                const users = zip(profiles, statuses).map(([profile, status]) => ({...profile, ...status}));

                // # Sort 'em
                const sortedUsers = sortBy(users, [
                    ({is_bot: isBot}) => (isBot ? 1 : 0), // users first
                    ({status}) => STATUS_PRIORITY[status],
                    ({username}) => username,
                ]);

                // * Verify order of member-dropdown users against API-sourced/data-sorted version
                cy.wrap(usernames).should('deep.equal', sortedUsers.map(({username}) => username));
            });

            // * Verify no statuses on bots
            cy.get('#member-list-popover .more-modal__row--bot .status-wrapper .status').should('not.exist');

            // * Verify bot badges
            cy.get('#member-list-popover .more-modal__row--bot .Badge').then(($badges) => {
                $badges.toArray().forEach((badgeEl) => {
                    cy.wrap(badgeEl).then(() => badgeEl.scrollIntoView());
                    cy.wrap(badgeEl).should('be.visible').and('have.text', 'BOT');
                });
            });
        });
    });

    it('MM-T1836_1 Bot accounts display (Legacy Sidebar)', () => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelSidebarOrganization: 'disabled',
            },
        });

        cy.visit(`/${team.name}/messages/@${bots[0].username}`);

        cy.get('li.active > .sidebar-item').then(($link) => {
            $link[0]?.scrollIntoView();
            cy.wrap($link).find('.sidebar-item__name').should('have.text', bots[0].username);

            // * Verify bot icon exists
            // (too many flaky scrolling conditions and floating elements to check if visible)
            cy.wrap($link).find('.icon.icon__bot');
        });
    });

    it('MM-T1836_2 Bot accounts display (New Sidebar)', () => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelSidebarOrganization: 'always_on',
            },
        });

        cy.visit(`/${team.name}/messages/@${bots[0].username}`);

        cy.get('.dmCategory .SidebarChannel.active > .SidebarLink').then(($link) => {
            // * Verify DM label
            cy.wrap($link).find('.SidebarChannelLinkLabel').should('have.text', bots[0].username);

            // * Verify bot icon exists
            // (too many flaky scrolling conditions and floating elements to check if visible)
            cy.wrap($link).find('.icon.icon-robot-happy');
        });

        cy.postMessage('Bump bot chat recency');

        // # Open a new DM
        cy.visit(`/${team.name}/messages/@${createdUsers[0].username}`);
        cy.postMessage('Hello, regular user');

        // * Verify Bots and Regular users as siblings in DMs
        cy.get('.dmCategory .SidebarChannel.active').siblings('.SidebarChannel').then(($siblings) => {
            cy.wrap($siblings).contains('.SidebarChannelLinkLabel', bots[0].username);
        });
    });
});
