// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomId} from '../../utils';

// *****************************************************************************
// Teams
// https://api.mattermost.com/#tag/teams
// *****************************************************************************

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
        cy.wrap({team: response.body});
    });
});

Cypress.Commands.add('apiDeleteTeam', (teamId, permanent = false) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/teams/' + teamId + (permanent ? '?permanent=true' : ''),
        method: 'DELETE',
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap({data: response.body});
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
        cy.wrap({team: response.body});
    });
});

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

Cypress.Commands.add('apiGetAllTeams', ({page = 0, perPage = 60} = {}) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `api/v4/teams?page=${page}&per_page=${perPage}`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap({teams: response.body});
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
