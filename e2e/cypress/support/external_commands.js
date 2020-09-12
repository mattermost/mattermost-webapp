// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAdminAccount} from './env';

Cypress.Commands.add('externalAddUserToTeam', (teamId, userId) => {
    const baseUrl = Cypress.config('baseUrl');
    const admin = getAdminAccount();

    cy.externalRequest({user: admin, method: 'post', baseUrl, path: `teams/${teamId}/members`, data: {team_id: teamId, user_id: userId}});
});

Cypress.Commands.add('externalActivateUser', (userId, active = true) => {
    const baseUrl = Cypress.config('baseUrl');
    const admin = getAdminAccount();

    cy.externalRequest({user: admin, method: 'put', baseUrl, path: `users/${userId}/active`, data: {active}});
});
