// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="cypress" />

// ***************************************************************
// Each command should be properly documented using JSDoc.
// See https://jsdoc.app/index.html for reference.
// Basic requirements for documentation are the following:
// - Meaningful description
// - Specific link to https://api.mattermost.com
// - Each parameter with `@params`
// - Return value with `@returns`
// - Example usage with `@example`
// Custom command should follow naming convention of having `api` prefix, e.g. `apiLogin`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable<Subject = any> {

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
        apiGetTeamMembers(teamId: string): Chainable<TeamMembership[]>;

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
        apiUpdateTeamMemberSchemeRole(teamId: string, userId: string, schemeRoles: Record<string, any>): Chainable<Record<string, any>>;
    }
}
