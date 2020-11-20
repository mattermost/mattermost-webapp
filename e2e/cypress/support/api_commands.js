// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAdminAccount} from './env';

// *****************************************************************************
// Read more:
// - https://on.cypress.io/custom-commands on writing Cypress commands
// - https://api.mattermost.com/ for Mattermost API reference
// *****************************************************************************

// *****************************************************************************
// Commands
// https://api.mattermost.com/#tag/commands
// *****************************************************************************

/**
 * Creates a command directly via API
 * This API assume that the user is logged in and has required permission to create a command
 * @param {Object} command - command to be created
 */
Cypress.Commands.add('apiCreateCommand', (command = {}) => {
    const options = {
        url: '/api/v4/commands',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
        body: command,
    };

    return cy.request(options).then((response) => {
        expect(response.status).to.equal(201);
        return {data: response.body, status: response.status};
    });
});

// *****************************************************************************
// Email
// *****************************************************************************

/**
 * Test SMTP setup
 */
Cypress.Commands.add('apiEmailTest', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/email/test',
        method: 'POST',
    }).then((response) => {
        expect(response.status, 'SMTP not setup at sysadmin config').to.equal(200);
        cy.wrap(response);
    });
});

// *****************************************************************************
// Posts
// https://api.mattermost.com/#tag/posts
// *****************************************************************************

/**
* Creates a post directly via API
* This API assume that the user is logged in and has cookie to access
* @param {String} channelId - Where to post
* @param {String} message - What to post
* @param {String} rootId - Parent post ID. Set to "" to avoid nesting
* @param {Object} props - Post props
* @param {String} token - Optional token to use for auth. If not provided - posts as current user
*/
Cypress.Commands.add('apiCreatePost', (channelId, message, rootId, props, token = '', failOnStatusCode = true) => {
    const headers = {'X-Requested-With': 'XMLHttpRequest'};
    if (token !== '') {
        headers.Authorization = `Bearer ${token}`;
    }
    return cy.request({
        headers,
        failOnStatusCode,
        url: '/api/v4/posts',
        method: 'POST',
        body: {
            channel_id: channelId,
            root_id: rootId,
            message,
            props,
        },
    });
});

/**
 * Creates a post directly via API
 * This API assume that the user is logged in as admin
 * @param {String} userDd - user for whom to create the token
 */
Cypress.Commands.add('apiCreateToken', (userId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/users/${userId}/tokens`,
        method: 'POST',
        body: {
            description: 'some text',
        },
    }).then((response) => {
        // * Validate that request was denied
        expect(response.status).to.equal(200);
        return {token: response.body.token};
    });
});

/**
 * Unpins pinned posts of given postID directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {Post} postId - Post ID of the pinned post to unpin
 */
Cypress.Commands.add('apiUnpinPosts', (postId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/posts/' + postId + '/unpin',
        method: 'POST',
    });
});

// *****************************************************************************
// Webhooks
// https://api.mattermost.com/#tag/webhooks
// *****************************************************************************

Cypress.Commands.add('apiCreateWebhook', (hook = {}, isIncoming = true) => {
    const hookUrl = isIncoming ? '/api/v4/hooks/incoming' : '/api/v4/hooks/outgoing';
    const options = {
        url: hookUrl,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
        body: hook,
    };

    return cy.request(options).then((response) => {
        const data = response.body;
        return {...data, url: isIncoming ? `${Cypress.config().baseUrl}/hooks/${data.id}` : ''};
    });
});

/**
 * Gets a team on the system
 * * @param {String} teamId - The team ID to get
 * All parameter required
 */

Cypress.Commands.add('apiGetTeam', (teamId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `api/v4/teams/${teamId}`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Remove a User from a Channel directly via API
 * @param {String} channelId - The channel ID
 * @param {String} userId - The user ID
 * All parameter required
 */
Cypress.Commands.add('removeUserFromChannel', (channelId, userId) => {
    //Remove a User from a Channel
    const baseUrl = Cypress.config('baseUrl');
    const admin = getAdminAccount();

    cy.externalRequest({user: admin, method: 'delete', baseUrl, path: `channels/${channelId}/members/${userId}`});
});

/**
 * Remove a User from a Team directly via API
 * @param {String} teamID - The team ID
 * @param {String} userId - The user ID
 * All parameter required
 */
Cypress.Commands.add('removeUserFromTeam', (teamId, userId) => {
    //Remove a User from a Channel
    const baseUrl = Cypress.config('baseUrl');
    const admin = getAdminAccount();

    cy.externalRequest({user: admin, method: 'delete', baseUrl, path: `teams/${teamId}/members/${userId}`});
});

/**
 * Get LDAP Group Sync Job Status
 *
 */
Cypress.Commands.add('apiGetLDAPSync', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/jobs/type/ldap_sync?page=0&per_page=50',
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

// *****************************************************************************
// Groups
// https://api.mattermost.com/#tag/groups
// *****************************************************************************

/**
 * Get all groups via the API
 *
 * @param {Integer} page - The desired page of the paginated list
 * @param {Integer} perPage - The number of groups per page
 *
 */
Cypress.Commands.add('apiGetGroups', (page = 0, perPage = 100) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups?page=${page}&per_page=${perPage}`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Patch a group directly via API
 *
 * @param {String} name - The new name for the group
 * @param {Object} patch
 *   {Boolean} allow_reference - Whether to allow reference (group mention) or not  - true/false
 *   {String} name - Name for the group, used for group mentions
 *   {String} display_name - Display name for the group
 *   {String} description - Description for the group
 *
 */
Cypress.Commands.add('apiPatchGroup', (groupID, patch) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups/${groupID}/patch`,
        method: 'PUT',
        timeout: 60000,
        body: patch,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Get all LDAP groups via API
 * @param {Integer} page - The page to select
 * @param {Integer} perPage - The number of groups per page
 */
Cypress.Commands.add('apiGetLDAPGroups', (page = 0, perPage = 100) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/ldap/groups?page=${page}&per_page=${perPage}`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Add a link for LDAP group via API
 * @param {String} remoteId - remote ID of the group
 */
Cypress.Commands.add('apiAddLDAPGroupLink', (remoteId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/ldap/groups/${remoteId}/link`,
        method: 'POST',
        timeout: 60000,
    }).then((response) => {
        return cy.wrap(response);
    });
});

/**
 * Retrieve the list of groups associated with a given team via API
 * @param {String} teamId - Team GUID
 */
Cypress.Commands.add('apiGetTeamGroups', (teamId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/teams/${teamId}/groups`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Delete a link from a team to a group via API
 * @param {String} groupId - Group GUID
 * @param {String} teamId - Team GUID
 */
Cypress.Commands.add('apiDeleteLinkFromTeamToGroup', (groupId, teamId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups/${groupId}/teams/${teamId}/link`,
        method: 'DELETE',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiLinkGroup', (groupID) => {
    return linkUnlinkGroup(groupID, 'POST');
});

Cypress.Commands.add('apiUnlinkGroup', (groupID) => {
    return linkUnlinkGroup(groupID, 'DELETE');
});

function linkUnlinkGroup(groupID, httpMethod) {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/ldap/groups/${groupID}/link`,
        method: httpMethod,
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 204]);
        return cy.wrap(response);
    });
}

Cypress.Commands.add('apiGetGroupTeams', (groupID) => {
    return getGroupSyncables(groupID, 'team');
});

Cypress.Commands.add('apiGetGroupTeam', (groupID, teamID) => {
    return getGroupSyncable(groupID, 'team', teamID);
});

Cypress.Commands.add('apiGetGroupChannels', (groupID) => {
    return getGroupSyncables(groupID, 'channel');
});

Cypress.Commands.add('apiGetGroupChannel', (groupID, channelID) => {
    return getGroupSyncable(groupID, 'channel', channelID);
});

function getGroupSyncable(groupID, syncableType, syncableID) {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups/${groupID}/${syncableType}s/${syncableID}`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}

function getGroupSyncables(groupID, syncableType) {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups/${groupID}/${syncableType}s?page=0&per_page=100`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}

Cypress.Commands.add('apiUnlinkGroupTeam', (groupID, teamID) => {
    return linkUnlinkGroupSyncable(groupID, teamID, 'team', 'DELETE');
});

Cypress.Commands.add('apiLinkGroupTeam', (groupID, teamID) => {
    return linkUnlinkGroupSyncable(groupID, teamID, 'team', 'POST');
});

Cypress.Commands.add('apiUnlinkGroupChannel', (groupID, channelID) => {
    return linkUnlinkGroupSyncable(groupID, channelID, 'channel', 'DELETE');
});

Cypress.Commands.add('apiLinkGroupChannel', (groupID, channelID) => {
    return linkUnlinkGroupSyncable(groupID, channelID, 'channel', 'POST');
});

function linkUnlinkGroupSyncable(groupID, syncableID, syncableType, httpMethod) {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups/${groupID}/${syncableType}s/${syncableID}/link`,
        method: httpMethod,
        timeout: 60000,
        body: {auto_add: true},
    }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 204]);
        return cy.wrap(response);
    });
}
