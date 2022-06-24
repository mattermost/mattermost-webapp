// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Team, TeamMembership} from '@mattermost/types/teams';

import {getRandomId} from '../../utils';

import {ChainableT} from './types';

// *****************************************************************************
// Teams
// https://api.mattermost.com/#tag/teams
// *****************************************************************************

export function createTeamPatch(name = 'team', displayName = 'Team', type = 'O', unique = true) {
    const randomSuffix = getRandomId();

    return {
        name: unique ? `${name}-${randomSuffix}` : name,
        display_name: unique ? `${displayName} ${randomSuffix}` : displayName,
        type,
    };
}
function apiCreateTeam(name: string, displayName: string, type?: string, unique?: boolean, options?: Partial<Team>): ChainableT<{team: Team}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/teams',
        method: 'POST',
        body: {
            ...createTeamPatch(name, displayName, type, unique),
            ...options,
        },
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap({team: response.body});
    });
}
Cypress.Commands.add('apiCreateTeam', apiCreateTeam);

function apiDeleteTeam(teamId: string, permanent = false): ChainableT<{data: any}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/teams/' + teamId + (permanent ? '?permanent=true' : ''),
        method: 'DELETE',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({data: response.body});
    });
}
Cypress.Commands.add('apiDeleteTeam', apiDeleteTeam);

function apiDeleteUserFromTeam(teamId: string, userId: string): ChainableT<{data: any}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/teams/' + teamId + '/members/' + userId,
        method: 'DELETE',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({data: response.body});
    });
}
Cypress.Commands.add('apiDeleteUserFromTeam', apiDeleteUserFromTeam);

function apiPatchTeam(teamId: string, teamData: Partial<Team>): ChainableT<{team: Team}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/teams/${teamId}/patch`,
        method: 'PUT',
        body: teamData,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({team: response.body});
    });
}
Cypress.Commands.add('apiPatchTeam', apiPatchTeam);

function apiGetTeamByName(name: string): ChainableT<{team: Team}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/teams/name/' + name,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({team: response.body});
    });
}
Cypress.Commands.add('apiGetTeamByName', apiGetTeamByName);

function apiGetAllTeams({page = 0, perPage = 60} = {}): ChainableT<{teams: Team[]}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `api/v4/teams?page=${page}&per_page=${perPage}`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({teams: response.body});
    });
}
Cypress.Commands.add('apiGetAllTeams', apiGetAllTeams);

function apiGetTeamsForUser(userId = 'me'): ChainableT<{teams: Team[]}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `api/v4/users/${userId}/teams`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({teams: response.body});
    });
}
Cypress.Commands.add('apiGetTeamsForUser', apiGetTeamsForUser);

function apiAddUserToTeam(teamId: string, userId: string): ChainableT<{member: TeamMembership}> {
    return cy.request({
        method: 'POST',
        url: `/api/v4/teams/${teamId}/members`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        body: {team_id: teamId, user_id: userId},
        qs: {team_id: teamId},
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap({member: response.body});
    });
}
Cypress.Commands.add('apiAddUserToTeam', apiAddUserToTeam);

function apiAddUsersToTeam(teamId: string, teamMembers: TeamMembership[]): ChainableT<{members: TeamMembership[]}> {
    return cy.request({
        method: 'POST',
        url: `/api/v4/teams/${teamId}/members/batch`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        body: teamMembers,
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap({members: response.body});
    });
}
Cypress.Commands.add('apiAddUsersToTeam', apiAddUsersToTeam);

function apiGetTeamMembers(teamId: string): ChainableT<{members: TeamMembership[]}> {
    return cy.request({
        method: 'GET',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/teams/${teamId}/members`,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({members: response.body});
    });
}
Cypress.Commands.add('apiGetTeamMembers', apiGetTeamMembers);

function apiUpdateTeamMemberSchemeRole(teamId: string, userId: string, schemeRoles: Partial<TeamMembership> = {}): ChainableT<{data: any}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/teams/${teamId}/members/${userId}/schemeRoles`,
        method: 'PUT',
        body: schemeRoles,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({data: response.body});
    });
}
Cypress.Commands.add('apiUpdateTeamMemberSchemeRole', apiUpdateTeamMemberSchemeRole);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Create a team.
             * See https://api.mattermost.com/#tag/teams/paths/~1teams/post
             * @param {String} name - Unique handler for a team, will be present in the team URL
             * @param {String} displayName - Non-unique UI name for the team
             * @param {String} type - 'O' for open (default), 'I' for invite only
             * @param {Boolean} unique - if true (default), it will create with unique/random team name.
             * @param {Partial<Team>} options - other fields of team to include
             * @returns {Team} `out.team` as `Team`
             *
             * @example
             *   cy.apiCreateTeam('test-team', 'Test Team').then(({team}) => {
             *       // do something with team
             *   });
             */
            apiCreateTeam: typeof apiCreateTeam;

            /**
             * Delete a team.
             * Soft deletes a team, by marking the team as deleted in the database.
             * Optionally use the permanent query parameter to hard delete the team.
             * See https://api.mattermost.com/#tag/teams/paths/~1teams~1{team_id}/delete
             * @param {String} teamId - The team ID to be deleted
             * @param {Boolean} permanent - false (default) as soft delete and true as permanent delete
             * @returns {Object} `out.data` as response status
             *
             * @example
             *   cy.apiDeleteTeam('test-id');
             */
            apiDeleteTeam: typeof apiDeleteTeam;

            /**
             * Delete the team member object for a user, effectively removing them from a team.
             * See https://api.mattermost.com/#tag/teams/paths/~1teams~1{team_id}~1members~1{user_id}/delete
             * @param {String} teamId - The team ID which the user is to be removed from
             * @param {String} userId - The user ID to be removed from team
             * @returns {Object} `out.data` as response status
             *
             * @example
             *   cy.apiDeleteUserFromTeam('team-id', 'user-id');
             */
            apiDeleteUserFromTeam: typeof apiDeleteUserFromTeam;

            /**
             * Patch a team.
             * Partially update a team by providing only the fields you want to update.
             * Omitted fields will not be updated.
             * The fields that can be updated are defined in the request body, all other provided fields will be ignored.
             * See https://api.mattermost.com/#tag/teams/paths/~1teams/post
             * @param {String} teamId - The team ID to be patched
             * @param {String} patch.display_name - Display name
             * @param {String} patch.description - Description
             * @param {String} patch.company_name - Company name
             * @param {String} patch.allowed_domains - Allowed domains
             * @param {Boolean} patch.allow_open_invite - Allow open invite
             * @param {Boolean} patch.group_constrained - Group constrained
             * @returns {Team} `out.team` as `Team`
             *
             * @example
             *   cy.apiPatchTeam('test-team', {display_name: 'New Team', group_constrained: true}).then(({team}) => {
             *       // do something with team
             *   });
             */
            apiPatchTeam: typeof apiPatchTeam;

            /**
             * Get a team based on provided name string.
             * See https://api.mattermost.com/#tag/teams/paths/~1teams~1name~1{name}/get
             * @param {String} name - Name of a team
             * @returns {Team} `out.team` as `Team`
             *
             * @example
             *   cy.apiGetTeamByName('team-name').then(({team}) => {
             *       // do something with team
             *   });
             */
            apiGetTeamByName: typeof apiGetTeamByName;

            /**
             * Get teams.
             * For regular users only returns open teams.
             * Users with the "manage_system" permission will return teams regardless of type.
             * See https://api.mattermost.com/#tag/teams/paths/~1teams/get
             * @param {String} queryParams.page - Page to select, 0 (default)
             * @param {String} queryParams.perPage - The number of teams per page, 60 (default)
             * @returns {Team[]} `out.teams` as `Team[]`
             * @returns {number} `out.totalCount` as `number`
             *
             * @example
             *   cy.apiGetAllTeams().then(({teams}) => {
             *       // do something with teams
             *   });
             */
            apiGetAllTeams: typeof apiGetAllTeams;

            /**
             * Get a list of teams that a user is on.
             * See https://api.mattermost.com/#tag/teams/paths/~1users~1{user_id}~1teams/get
             * @param {String} userId - User ID to get teams, or 'me' (default)
             * @returns {Team[]} `out.teams` as `Team[]`
             *
             * @example
             *   cy.apiGetTeamsForUser().then(({teams}) => {
             *       // do something with teams
             *   });
             */
            apiGetTeamsForUser: typeof apiGetTeamsForUser;

            /**
             * Add user to the team by user_id.
             * See https://api.mattermost.com/#tag/teams/paths/~1teams~1{team_id}~1members/post
             * @param {String} teamId - Team ID
             * @param {String} userId - User ID to be added into a team
             * @returns {TeamMembership} `out.member` as `TeamMembership`
             *
             * @example
             *   cy.apiAddUserToTeam('team-id', 'user-id').then(({member}) => {
             *       // do something with member
             *   });
             */
            apiAddUserToTeam: typeof apiAddUserToTeam;

            /**
             * Get team members.
             * See https://api.mattermost.com/#tag/teams/paths/~1teams~1{team_id}~1members/get
             * @param {string} teamId - team ID
             * @returns {TeamMembership[]} `out.members` as `TeamMembership[]`
             *
             * @example
             *   cy.apiGetTeamMembers(teamId).then(({members}) => {
             *       // do something with members
             *   });
             */
            apiGetTeamMembers: typeof apiGetTeamMembers;

            /**
             * Add a number of users to the team.
             * See https://api.mattermost.com/#tag/teams/paths/~1teams~1{team_id}~1members~1batch/post
             * @param {string} teamId - team ID
             * @param {TeamMembership[]} teamMembers - users to add
             * @returns {TeamMembership[]} `out.members` as `TeamMembership[]`
             *
             * @example
             *   cy.apiAddUsersToTeam(teamId, [{team_id: 'team-id', user_id: 'user-id'}]).then(({members}) => {
             *       // do something with members
             *   });
             */
            apiAddUsersToTeam: typeof apiAddUsersToTeam;

            /**
             * Update the scheme-derived roles of a team member.
             * Requires sysadmin session to initiate this command.
             * See https://api.mattermost.com/#tag/teams/paths/~1teams~1{team_id}~1members~1{user_id}~1schemeRoles/put
             * @param {string} teamId - team ID
             * @param {string} userId - user ID
             * @param {Object} schemeRoles.scheme_admin - false (default) or true to change into team admin
             * @param {Object} schemeRoles.scheme_user - true (default) or false to change not to be a team user
             * @returns {Object} `out.data` as response status
             *
             * @example
             *   cy.apiUpdateTeamMemberSchemeRole(teamId, userId, {scheme_admin: false, scheme_user: true});
             */
            apiUpdateTeamMemberSchemeRole: typeof apiUpdateTeamMemberSchemeRole;
        }
    }
}
