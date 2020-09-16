// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomId} from '../../utils';

// *****************************************************************************
// Channels
// https://api.mattermost.com/#tag/channels
// *****************************************************************************

Cypress.Commands.add('apiCreateChannel', (teamId, name, displayName, type = 'O', purpose = '', header = '', unique = true) => {
    const randomSuffix = getRandomId();

    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels',
        method: 'POST',
        body: {
            team_id: teamId,
            name: unique ? `${name}-${randomSuffix}` : name,
            display_name: unique ? `${displayName} ${randomSuffix}` : displayName,
            type,
            purpose,
            header,
        },
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap({channel: response.body});
    });
});

Cypress.Commands.add('apiCreateDirectChannel', (userIds = []) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels/direct',
        method: 'POST',
        body: userIds,
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap({channel: response.body});
    });
});

Cypress.Commands.add('apiCreateGroupChannel', (userIds = []) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels/group',
        method: 'POST',
        body: userIds,
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap({channel: response.body});
    });
});

Cypress.Commands.add('apiPatchChannelPrivacy', (channelId, privacy = 'O') => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'PUT',
        url: `/api/v4/channels/${channelId}/privacy`,
        body: {privacy},
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});
