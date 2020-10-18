// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAdminAccount} from './env';

/**
 * Add a user to a team directly via API
 * @param {String} teamId - The team ID
 * @param {String} userId - The user ID
 * All parameter required
 */

Cypress.Commands.add('externalAddUserToTeam', (teamId, userId) => {
    const baseUrl = Cypress.config('baseUrl');
    const admin = getAdminAccount();

    cy.externalRequest({user: admin, method: 'post', baseUrl, path: `teams/${teamId}/members`, data: {team_id: teamId, user_id: userId}});
});
