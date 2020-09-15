// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

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
