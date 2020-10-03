// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// *****************************************************************************
// Bots
// https://api.mattermost.com/#tag/bots
// *****************************************************************************

Cypress.Commands.add('apiCreateBot', (username, displayName, description) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/bots',
        method: 'POST',
        body: {
            username,
            display_name: displayName,
            description,
        },
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap({bot: response.body});
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
