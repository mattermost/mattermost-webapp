// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomId} from '../../utils';

// *****************************************************************************
// Bots
// https://api.mattermost.com/#tag/bots
// *****************************************************************************

Cypress.Commands.add('apiCreateBot', ({prefix, bot = null} = {}) => {
    const newBot = bot || generateRandomBot(prefix);

    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/bots',
        method: 'POST',
        body: newBot,
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
});

Cypress.Commands.add('apiGetBots', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/bots',
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({bots: response.body});
    });
});

export function generateRandomBot(prefix = 'bot') {
    const randomId = getRandomId();

    return {
        username: `${prefix}-${randomId}`,
        display_name: `Test Bot ${randomId}`,
        description: `Test bot description ${randomId}`,
    };
}
