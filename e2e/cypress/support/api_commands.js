// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import xor from 'lodash.xor';

import {getRandomId} from '../utils';

import {getAdminAccount} from './env';

// *****************************************************************************
// Read more:
// - https://on.cypress.io/custom-commands on writing Cypress commands
// - https://api.mattermost.com/ for Mattermost API reference
// *****************************************************************************

// *******************************************************************************
// Bots
// https://api.mattermost.com/#tag/bots
// *******************************************************************************

Cypress.Commands.add('apiGetBots', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/bots',
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

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
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiCreateDirectChannel', (userids) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels/direct',
        method: 'POST',
        body: userids,
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap(response);
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
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiDeleteChannel', (channelId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels/' + channelId,
        method: 'DELETE',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiUpdateChannel', (channelId, channelData) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels/' + channelId,
        method: 'PUT',
        body: {
            id: channelId,
            ...channelData,
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiPatchChannel', (channelId, channelData) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'PUT',
        url: `/api/v4/channels/${channelId}/patch`,
        body: channelData,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiGetChannelByName', (teamName, channelName) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/teams/name/${teamName}/channels/name/${channelName}`,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiGetChannel', (channelId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/channels/${channelId}`,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiGetAllChannels', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiAddUserToChannel', (channelId, userId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels/' + channelId + '/members',
        method: 'POST',
        body: {
            user_id: userId,
        },
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap(response);
    });
});

/**
 * https://api.mattermost.com/#tag/channels/paths/~1users~1{user_id}~1teams~1{team_id}~1channels/get
 */
Cypress.Commands.add('apiGetChannelsForUser', (userId, teamId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/users/${userId}/teams/${teamId}/channels`,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

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
* Unpins pinned posts of given postID directly via API
* This API assume that the user is logged in and has cookie to access
* @param {String} postId - Post ID of the pinned post to unpin
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
 * Demote a Member to Guest directly via API
 * @param {String} userId - The user ID
 * All parameter required
 */
Cypress.Commands.add('demoteUser', (userId) => {
    //Demote Regular Member to Guest User
    const baseUrl = Cypress.config('baseUrl');
    const admin = getAdminAccount();

    cy.externalRequest({user: admin, method: 'post', baseUrl, path: `users/${userId}/demote`});
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
 * Promote a Guest to a Member directly via API
 * @param {String} userId - The user ID
 * All parameter required
 */
Cypress.Commands.add('promoteUser', (userId) => {
    //Promote Regular Member to Guest User
    const baseUrl = Cypress.config('baseUrl');
    const admin = getAdminAccount();

    cy.externalRequest({user: admin, method: 'post', baseUrl, path: `users/${userId}/promote`});
});

// *****************************************************************************
// Plugins
// https://api.mattermost.com/#tag/plugins
// *****************************************************************************

/**
 * Install plugin from URL directly via API.
 *
 * @param {String} pluginDownloadUrl - URL used to download the plugin
 * @param {String} force - Set to 'true' to overwrite a previously installed plugin with the same ID, if any
 */
Cypress.Commands.add('apiInstallPluginFromUrl', (pluginDownloadUrl, force = false) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/install_from_url?plugin_download_url=${encodeURIComponent(pluginDownloadUrl)}&force=${force}`,
        method: 'POST',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap(response);
    });
});

/**
 * Remove the plugin with the provided ID from the server. All plugin files are deleted.
 *
 * @param {String} pluginId - Id of the plugin to uninstall
 */
Cypress.Commands.add('apiRemovePluginById', (pluginId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/${encodeURIComponent(pluginId)}`,
        method: 'DELETE',
        failOnStatusCode: false,
    }).then((response) => {
        if (response.status !== 200 && response.status !== 404) {
            expect(response.status).to.equal(200);
        }
        return cy.wrap(response);
    });
});

/**
 * Get all user`s plugins.
 *
 */
Cypress.Commands.add('apiGetAllPlugins', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/plugins',
        method: 'GET',
        failOnStatusCode: false,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Enable plugin by id.
 *
 * @param {String} pluginId - Id of the plugin to enable
 */
Cypress.Commands.add('apiEnablePluginById', (pluginId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/${encodeURIComponent(pluginId)}/enable`,
        method: 'POST',
        timeout: 60000,
        failOnStatusCode: true,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Upload binary file by name and Type *
 * @param {String} filename - name of the plugin to upload
 */
Cypress.Commands.add('apiUploadPlugin', (filename) => {
    cy.apiUploadFile('plugin', filename, {url: '/api/v4/plugins', method: 'POST', successStatus: 201});
});

/**
 * Creates a bot directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} username - The bots username
 * @param {String} displayName - The non-unique UI name for the bot
 * @param {String} description - The description of the bot
 * All parameters are required
 */
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
        return cy.wrap(response);
    });
});

/**
 * Get access token
 * This API assume that the user is logged in and has cookie to access
 * @param {String} user_id - The user id to generate token for
 * @param {String} description - The description of the token usage
 * All parameters are required
 */
Cypress.Commands.add('apiAccessToken', (userId, description) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/' + userId + '/tokens',
        method: 'POST',
        body: {
            description,
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response.body.token);
    });
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
// Roles
// https://api.mattermost.com/#tag/roles
// *****************************************************************************

/**
 * Get role by name.
 *
 * @param {String} roleName - Name of the role to get
 */
Cypress.Commands.add('getRoleByName', (roleName) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/roles/name/${roleName}`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

export const defaultRolesPermissions = {
    team_admin: [
        'edit_others_posts',
        'remove_user_from_team',
        'manage_team', 'import_team',
        'manage_team_roles',
        'manage_channel_roles',
        'manage_slash_commands',
        'manage_others_slash_commands',
        'manage_incoming_webhooks',
        'manage_outgoing_webhooks',
        'delete_post',
        'delete_others_posts',
        'manage_others_outgoing_webhooks',
        'add_reaction',
        'manage_others_incoming_webhooks',
        'use_channel_mentions',
        'manage_public_channel_members',
        'manage_private_channel_members',
        'create_post',
        'remove_reaction',
        'use_group_mentions',
    ],
    channel_admin: [
        'manage_channel_roles',
        'create_post',
        'add_reaction',
        'remove_reaction',
        'manage_public_channel_members',
        'manage_private_channel_members',
        'use_channel_mentions',
        'use_group_mentions',
    ],
    system_user: [
        'create_direct_channel',
        'create_group_channel',
        'permanent_delete_user',
        'create_team',
        'get_public_link',
        'list_public_teams',
        'join_public_teams',
        'view_members',
    ],
    team_user: [
        'list_team_channels',
        'join_public_channels',
        'read_public_channel',
        'view_team',
        'create_public_channel',
        'create_private_channel',
        'invite_user',
        'add_user_to_team',
    ],
    channel_user: [
        'manage_public_channel_properties',
        'delete_public_channel',
        'manage_private_channel_properties',
        'delete_private_channel',
        'read_channel',
        'add_reaction',
        'remove_reaction',
        'manage_public_channel_members',
        'upload_file',
        'create_post',
        'use_slash_commands',
        'manage_private_channel_members',
        'delete_post',
        'edit_post',
        'use_channel_mentions',
        'use_group_mentions',
    ],
    system_guest: [
        'create_direct_channel',
        'create_group_channel',
    ],
    team_guest: [
        'view_team',
    ],
    channel_guest: [
        'edit_post',
        'add_reaction',
        'remove_reaction',
        'use_channel_mentions',
        'use_slash_commands',
        'read_channel',
        'upload_file',
        'create_post',
    ],
};

/**
 * Get a list of roles from their names
 * https://api.mattermost.com/#tag/roles/paths/~1roles~1names/post
 */
Cypress.Commands.add('apiGetRolesByNames', (names) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/roles/names',
        method: 'POST',
        body: names || Object.keys(defaultRolesPermissions),
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Patch a role.
 *
 * @param {String} roleID - ID of the role to patch
 * @param {String} force - Set to 'true' to overwrite a previously installed plugin with the same ID, if any
 */
Cypress.Commands.add('apiPatchRole', (roleID, patch) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/roles/${roleID}/patch`,
        method: 'PUT',
        timeout: 60000,
        body: patch,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiResetRoles', () => {
    cy.apiGetRolesByNames().then((res) => {
        const rolePermissions = res.body;

        rolePermissions.forEach((role) => {
            const defaultPermissions = defaultRolesPermissions[role.name];
            const diff = xor(role.permissions, defaultPermissions);

            if (diff.length > 0) {
                cy.apiPatchRole(role.id, {permissions: defaultPermissions});
            }
        });
    });
});

/**
 * Get all schemes in the system - must have PERMISSION_MANAGE_SYSTEM
 *
 * @param {String} scope - either "team" or "channel"
 */
Cypress.Commands.add('apiGetSchemes', (scope) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/schemes?scope=${scope}`,
        method: 'GET',
    });
});

/**
 * Delete a scheme directly via API
 *
 * @param {String} schemeId - the id of the scheme to delete
 */
Cypress.Commands.add('apiDeleteScheme', (schemeId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/schemes/' + schemeId,
        method: 'DELETE',
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
