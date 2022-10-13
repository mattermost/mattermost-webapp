// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Bot} from 'mattermost-redux/types/bots';

import {getRandomId} from '../../utils';

// *****************************************************************************
// Bots
// https://api.mattermost.com/#tag/bots
// *****************************************************************************

function apiCreateBot({prefix, bot = createBotPatch(prefix)}): Cypress.Chainable<{bot: Bot & {fullDisplayName: string}}> {
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

function apiGetBots(): Cypress.Chainable<{bots: Bot[]}> {
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
    };
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            apiCreateBot: typeof apiCreateBot;
            apiGetBots: typeof apiGetBots;
        }
    }
}
