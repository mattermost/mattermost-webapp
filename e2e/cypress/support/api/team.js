// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomId} from '../../utils';

// *****************************************************************************
// Teams
// https://api.mattermost.com/#tag/teams
// *****************************************************************************

/**
 * Creates a team directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} name - Unique handler for a team, will be present in the team URL
 * @param {String} displayName - Non-unique UI name for the team
 * @param {String} type - 'O' for open (default), 'I' for invite only
 * @param {Boolean} unique - if true (default), it will create with unique/random team namae.
 * All parameters required
 */
Cypress.Commands.add('apiCreateTeam', (name, displayName, type = 'O', unique = true) => {
    const randomSuffix = getRandomId();

    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/teams',
        method: 'POST',
        body: {
            name: unique ? `${name}-${randomSuffix}` : name,
            display_name: unique ? `${displayName} ${randomSuffix}` : displayName,
            type,
        },
    }).then((response) => {
        expect(response.status).to.equal(201);
        cy.wrap(response);
    });
});

/**
 * Deletes a team directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} teamId - The team ID to be deleted
 * All parameter required
 */
Cypress.Commands.add('apiDeleteTeam', (teamId, permanent = false) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/teams/' + teamId + (permanent ? '?permanent=true' : ''),
        method: 'DELETE',
    });
});

Cypress.Commands.add('apiPatchTeam', (teamId, teamData) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/teams/${teamId}/patch`,
        method: 'PUT',
        body: teamData,
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap(response);
    });
});

/**
 * Get a team based on provided name string
 * @param {String} name - name of a team
 */
Cypress.Commands.add('apiGetTeamByName', (name) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/teams/name/' + name,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap(response);
    });
});

/**
 * Gets a list of all of the teams on the server
 * This API assume that the user is logged in as sysadmin
 */
Cypress.Commands.add('apiGetAllTeams', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: 'api/v4/teams',
        method: 'GET',
    });
});

/**
 * Gets a list of the current user's teams
 * This API assume that the user is logged
 * no params required because we are using /me to refer to current user
 */
Cypress.Commands.add('apiGetTeams', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: 'api/v4/users/me/teams',
        method: 'GET',
    });
});

/**
 * Add user into a team directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} teamId - The team ID
 * @param {String} userId - ID of user to be added into a team
 * All parameter required
 */
Cypress.Commands.add('apiAddUserToTeam', (teamId, userId) => {
    cy.request({
        method: 'POST',
        url: `/api/v4/teams/${teamId}/members`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        body: {team_id: teamId, user_id: userId},
        qs: {team_id: teamId},
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap(response);
    });
});

/**
 * List users that are not team members
 * @param {String} teamId - The team GUID
 * @param {Integer} page - The desired page of the paginated list
 * @param {Integer} perPage - The number of users per page
 * All parameter required
 */
Cypress.Commands.add('apiGetUsersNotInTeam', (teamId, page = 0, perPage = 60) => {
    return cy.request({
        method: 'GET',
        url: `/api/v4/users?not_in_team=${teamId}&page=${page}&per_page=${perPage}`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap(response);
    });
});

/**
 * Join teammates directly via API
 * @param {String} teamId - The team GUID
 * @param {Array} teamMembers - The user IDs to join
 * All parameter required
 */
Cypress.Commands.add('apiAddUsersToTeam', (teamId, teamMembers) => {
    return cy.request({
        method: 'POST',
        url: `/api/v4/teams/${teamId}/members/batch`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        body: teamMembers,
    }).then((response) => {
        expect(response.status).to.equal(201);
        cy.wrap(response);
    });
});

Cypress.Commands.add('apiGetTeamMembers', (teamId) => {
    return cy.request({
        method: 'GET',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/teams/${teamId}/members`,
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap({members: response.body});
    });
});

Cypress.Commands.add('apiUpdateTeamMemberSchemeRole', (teamId, userId, schemeRoles = {}) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/teams/${teamId}/members/${userId}/schemeRoles`,
        method: 'PUT',
        body: schemeRoles,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({data: response.body});
    });
});
