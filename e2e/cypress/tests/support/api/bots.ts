// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from 'tests/types';

import {getRandomId} from '../../utils';

// *****************************************************************************
// Bots
// https://api.mattermost.com/#tag/bots
// *****************************************************************************

function apiCreateBot(prefix = 'bot'): ChainableT<any> {
    const bot = createBotPatch(prefix);
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/bots',
        method: 'POST',
        body: bot,
    }).then((response) => {
        expect(response.status).to.equal(201);
        const {body} = response;
        return cy.wrap({
            bot: {
                ...body,
                fullDisplayName: `${body.display_name} (@${body.username})`,
            },
        });
    });
}

Cypress.Commands.add('apiCreateBot', apiCreateBot);

function apiGetBots(): ChainableT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/bots',
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({bots: response.body});
    });
}

Cypress.Commands.add('apiGetBots', apiGetBots);

export function createBotPatch(prefix = 'bot') {
    const randomId = getRandomId();

    return {
        username: `${prefix}-${randomId}`,
        display_name: `Test Bot ${randomId}`,
        description: `Test bot description ${randomId}`,
        user_id: `Test Bot user_id ${randomId}`,
        owner_id: `Test Bot owner_id ${randomId}`,
        create_at: Date.now(),
        update_at: Date.now(),
        delete_at: Date.now(),
    };
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Create a bot.
             * See https://api.mattermost.com/#tag/bots/paths/~1bots/post
             * @param {string} options.bot - predefined `bot` object instead of random bot
             * @param {string} options.prefix - 'bot' (default) or any prefix to easily identify a bot
             * @returns {Bot} out.bot: `Bot` object
             *
             * @example
             *   cy.apiCreateBot().then(({bot}) => {
             *       // do something with bot
             *   });
             */
            apiCreateBot(prefix?: string): Chainable<{bot: Bot & {fullDisplayName: string}}>;

            /**
             * Get bots.
             * See https://api.mattermost.com/#tag/bots/paths/~1bots/get
             * @returns {Bot[]} out.bots: `Bot[]` object
             *
             * @example
             *   cy.apiGetBots();
             */
            apiGetBots(): Chainable<{bots: Bot[]}>;
        }
    }
}
