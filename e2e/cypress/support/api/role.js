// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import xor from 'lodash.xor';

// *****************************************************************************
// Preferences
// https://api.mattermost.com/#tag/roles
// *****************************************************************************

export const defaultRolesPermissions = {
    channel_admin: [
        'create_post',
        'manage_private_channel_members',
        'read_public_channel_groups',
        'manage_channel_roles',
        'use_channel_mentions',
        'use_group_mentions',
        'read_private_channel_groups',
        'remove_reaction',
        'add_reaction',
        'manage_public_channel_members',
    ],
    channel_guest: [
        'remove_reaction',
        'upload_file',
        'create_post',
        'use_channel_mentions',
        'use_slash_commands',
        'read_channel',
        'add_reaction',
        'edit_post',
    ],
    channel_user: [
        'remove_reaction',
        'use_slash_commands',
        'edit_post',
        'read_public_channel_groups',
        'delete_post',
        'read_private_channel_groups',
        'manage_public_channel_properties',
        'manage_public_channel_members',
        'delete_private_channel',
        'manage_private_channel_members',
        'manage_private_channel_properties',
        'use_channel_mentions',
        'create_post',
        'delete_public_channel',
        'use_group_mentions',
        'upload_file',
        'add_reaction',
        'read_channel',
        'get_public_link',
    ],
    sysadmin: [
        'read_user_access_token',
        'manage_incoming_webhooks',
        'delete_public_channel',
        'create_direct_channel',
        'list_private_teams',
        'sysconsole_write_user_management_channels',
        'sysconsole_write_authentication',
        'add_reaction',
        'list_users_without_team',
        'read_others_bots',
        'convert_private_channel_to_public',
        'sysconsole_read_user_management_permissions',
        'edit_post',
        'edit_other_users',
        'manage_team',
        'convert_public_channel_to_private',
        'sysconsole_write_user_management_users',
        'manage_system_wide_oauth',
        'manage_private_channel_members',
        'revoke_user_access_token',
        'sysconsole_read_authentication',
        'read_private_channel_groups',
        'manage_bots',
        'delete_private_channel',
        'create_group_channel',
        'add_user_to_team',
        'manage_others_slash_commands',
        'sysconsole_read_user_management_teams',
        'sysconsole_read_site',
        'read_public_channel_groups',
        'view_members',
        'remove_others_reactions',
        'sysconsole_write_reporting_site_statistics',
        'sysconsole_write_reporting_server_logs',
        'sysconsole_write_reporting_team_statistics',
        'list_team_channels',
        'create_private_channel',
        'read_channel',
        'create_public_channel',
        'use_slash_commands',
        'sysconsole_write_site',
        'sysconsole_write_user_management_groups',
        'read_jobs',
        'sysconsole_write_user_management_permissions',
        'create_bot',
        'sysconsole_read_user_management_channels',
        'use_group_mentions',
        'manage_public_channel_properties',
        'manage_others_bots',
        'sysconsole_read_compliance',
        'manage_channel_roles',
        'assign_bot',
        'sysconsole_write_environment',
        'assign_system_admin_role',
        'create_user_access_token',
        'sysconsole_write_plugins',
        'manage_system',
        'demote_to_guest',
        'manage_others_incoming_webhooks',
        'view_team',
        'delete_post',
        'promote_guest',
        'manage_public_channel_members',
        'sysconsole_write_user_management_teams',
        'sysconsole_write_compliance',
        'invite_user',
        'join_private_teams',
        'upload_file',
        'edit_others_posts',
        'delete_others_posts',
        'list_public_teams',
        'read_public_channel',
        'read_bots',
        'sysconsole_read_plugins',
        'manage_team_roles',
        'create_emojis',
        'sysconsole_read_user_management_groups',
        'join_public_channels',
        'create_post',
        'remove_reaction',
        'manage_slash_commands',
        'get_public_link',
        'sysconsole_read_environment',
        'read_other_users_teams',
        'manage_private_channel_properties',
        'manage_oauth',
        'remove_user_from_team',
        'create_post_ephemeral',
        'delete_emojis',
        'sysconsole_read_user_management_users',
        'manage_jobs',
        'create_team',
        'manage_roles',
        'sysconsole_read_reporting_server_logs',
        'sysconsole_read_reporting_site_statistics',
        'sysconsole_read_reporting_team_statistics',
        'get_logs',
        'get_analytics',
        'edit_brand',
        'use_channel_mentions',
        'delete_others_emojis',
        'invite_guest',
        'manage_others_outgoing_webhooks',
        'create_post_public',
        'manage_outgoing_webhooks',
        'import_team',
        'join_public_teams',
        'sysconsole_read_integrations_integration_management',
        'sysconsole_read_integrations_bot_accounts',
        'sysconsole_read_integrations_gif',
        'sysconsole_read_integrations_cors',
        'sysconsole_write_integrations_integration_management',
        'sysconsole_write_integrations_bot_accounts',
        'sysconsole_write_integrations_gif',
        'sysconsole_write_integrations_cors',
        'sysconsole_read_experimental_features',
        'sysconsole_read_experimental_feature_flags',
        'sysconsole_read_experimental_bleve',
        'sysconsole_write_experimental_features',
        'sysconsole_write_experimental_feature_flags',
        'sysconsole_write_experimental_bleve',
        'purge_bleve_indexes',
        'post_bleve_indexes',
        'sysconsole_read_about_edition_and_license',
        'sysconsole_write_about_edition_and_license',
        'read_license_information',
        'manage_license_information',
    ],
    system_guest: [
        'create_direct_channel',
        'create_group_channel',
    ],
    system_manager: [
        'read_public_channel_groups',
        'read_channel',
        'sysconsole_write_user_management_channels',
        'manage_private_channel_properties',
        'add_user_to_team',
        'manage_private_channel_members',
        'sysconsole_write_user_management_teams',
        'convert_private_channel_to_public',
        'manage_public_channel_members',
        'remove_user_from_team',
        'manage_team_roles',
        'sysconsole_read_user_management_groups',
        'manage_channel_roles',
        'list_private_teams',
        'sysconsole_read_authentication',
        'manage_jobs',
        'read_jobs',
        'sysconsole_read_plugins',
        'manage_public_channel_properties',
        'list_public_teams',
        'sysconsole_read_environment',
        'sysconsole_write_user_management_groups',
        'read_private_channel_groups',
        'delete_public_channel',
        'sysconsole_write_site',
        'sysconsole_read_user_management_channels',
        'sysconsole_read_user_management_teams',
        'sysconsole_write_user_management_permissions',
        'sysconsole_read_about_edition_and_license',
        'read_license_information',
        'sysconsole_read_site',
        'sysconsole_read_reporting',
        'sysconsole_read_reporting_server_logs',
        'sysconsole_read_reporting_site_statistics',
        'sysconsole_read_reporting_team_statistics',
        'get_logs',
        'get_analytics',
        'sysconsole_read_integrations_integration_management',
        'sysconsole_read_integrations_bot_accounts',
        'sysconsole_read_integrations_gif',
        'sysconsole_read_integrations_cors',
        'sysconsole_write_integrations_integration_management',
        'sysconsole_write_integrations_bot_accounts',
        'sysconsole_write_integrations_gif',
        'sysconsole_write_integrations_cors',
        'view_team',
        'convert_public_channel_to_private',
        'join_public_teams',
        'read_public_channel',
        'edit_brand',
        'join_private_teams',
        'sysconsole_read_user_management_permissions',
        'manage_team',
        'delete_private_channel',
        'sysconsole_write_environment',
    ],
    system_post_all: [
        'use_group_mentions',
        'use_channel_mentions',
        'create_post',
    ],
    system_post_all_public: [
        'use_group_mentions',
        'use_channel_mentions',
        'create_post_public',
    ],
    system_read_only_admin: [
        'list_private_teams',
        'list_public_teams',
        'read_public_channel_groups',
        'read_channel',
        'sysconsole_read_user_management_users',
        'read_other_users_teams',
        'sysconsole_read_user_management_permissions',
        'sysconsole_read_site',
        'sysconsole_read_user_management_channels',
        'sysconsole_read_about_edition_and_license',
        'read_license_information',
        'sysconsole_read_authentication',
        'sysconsole_read_user_management_teams',
        'sysconsole_read_user_management_groups',
        'sysconsole_read_plugins',
        'sysconsole_read_reporting_server_logs',
        'sysconsole_read_reporting_site_statistics',
        'sysconsole_read_reporting_team_statistics',
        'get_logs',
        'get_analytics',
        'read_jobs',
        'read_private_channel_groups',
        'view_team',
        'sysconsole_read_environment',
        'read_public_channel',
        'sysconsole_read_integrations_integration_management',
        'sysconsole_read_integrations_bot_accounts',
        'sysconsole_read_integrations_gif',
        'sysconsole_read_integrations_cors',
        'sysconsole_read_experimental_features',
        'sysconsole_read_experimental_feature_flags',
        'sysconsole_read_experimental_bleve',
    ],
    system_user: [
        'list_public_teams',
        'join_public_teams',
        'create_direct_channel',
        'create_group_channel',
        'create_team',
        'view_members',
        'create_emojis',
        'delete_emojis',
    ],
    system_user_access_token: [
        'revoke_user_access_token',
        'create_user_access_token',
        'read_user_access_token',
    ],
    system_user_manager: [
        'manage_private_channel_members',
        'manage_team_roles',
        'manage_public_channel_members',
        'read_channel',
        'read_public_channel_groups',
        'sysconsole_read_user_management_teams',
        'list_public_teams',
        'manage_private_channel_properties',
        'sysconsole_read_user_management_groups',
        'manage_team',
        'sysconsole_write_user_management_channels',
        'read_private_channel_groups',
        'list_private_teams',
        'sysconsole_write_user_management_teams',
        'remove_user_from_team',
        'delete_public_channel',
        'sysconsole_read_authentication',
        'convert_public_channel_to_private',
        'join_private_teams',
        'add_user_to_team',
        'sysconsole_read_user_management_permissions',
        'join_public_teams',
        'read_public_channel',
        'manage_public_channel_properties',
        'convert_private_channel_to_public',
        'manage_channel_roles',
        'read_jobs',
        'sysconsole_read_user_management_channels',
        'delete_private_channel',
        'view_team',
        'sysconsole_write_user_management_groups',
    ],
    team_admin: [
        'manage_private_channel_members',
        'delete_others_posts',
        'import_team',
        'convert_private_channel_to_public',
        'manage_incoming_webhooks',
        'delete_post',
        'create_post',
        'manage_others_outgoing_webhooks',
        'manage_others_incoming_webhooks',
        'manage_outgoing_webhooks',
        'manage_team',
        'manage_slash_commands',
        'read_private_channel_groups',
        'remove_user_from_team',
        'manage_channel_roles',
        'use_channel_mentions',
        'convert_public_channel_to_private',
        'manage_team_roles',
        'use_group_mentions',
        'read_public_channel_groups',
        'add_reaction',
        'manage_public_channel_members',
        'remove_reaction',
        'manage_others_slash_commands',
    ],
    team_guest: ['view_team'],
    team_post_all: [
        'use_channel_mentions',
        'use_group_mentions',
        'create_post',
    ],
    team_post_all_public: [
        'use_channel_mentions',
        'use_group_mentions',
        'create_post_public',
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
};

Cypress.Commands.add('getRoleByName', (name) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/roles/name/${name}`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({name: response.body});
    });
});

Cypress.Commands.add('apiGetRolesByNames', (names) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/roles/names',
        method: 'POST',
        body: names || Object.keys(defaultRolesPermissions),
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({roles: response.body});
    });
});

Cypress.Commands.add('apiPatchRole', (roleID, patch) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/roles/${roleID}/patch`,
        method: 'PUT',
        body: patch,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({role: response.body});
    });
});

Cypress.Commands.add('apiResetRoles', () => {
    cy.apiGetRolesByNames().then(({roles}) => {
        roles.forEach((role) => {
            const defaultPermissions = defaultRolesPermissions[role.name];
            const diff = xor(role.permissions, defaultPermissions);

            if (diff.length > 0) {
                cy.apiPatchRole(role.id, {permissions: defaultPermissions});
            }
        });
    });
});
