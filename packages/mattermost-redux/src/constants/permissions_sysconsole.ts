// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import Permissions from './permissions';

export const ResourceToSysConsolePermissionsTable: Record<string, Array<string>> = {
    about: [Permissions.SYSCONSOLE_READ_ABOUT, Permissions.SYSCONSOLE_WRITE_ABOUT],
    billing: [Permissions.SYSCONSOLE_READ_BILLING, Permissions.SYSCONSOLE_WRITE_BILLING],
    reporting: [Permissions.SYSCONSOLE_READ_REPORTING, Permissions.SYSCONSOLE_WRITE_REPORTING],
    'user_management.users': [Permissions.SYSCONSOLE_READ_USERMANAGEMENT_USERS, Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_USERS],
    'user_management.groups': [Permissions.SYSCONSOLE_READ_USERMANAGEMENT_GROUPS, Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_GROUPS],
    'user_management.teams': [Permissions.SYSCONSOLE_READ_USERMANAGEMENT_TEAMS, Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_TEAMS],
    'user_management.channels': [Permissions.SYSCONSOLE_READ_USERMANAGEMENT_CHANNELS, Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_CHANNELS],
    'user_management.permissions': [Permissions.SYSCONSOLE_READ_USERMANAGEMENT_PERMISSIONS, Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_PERMISSIONS],
    'user_management.system_roles': [Permissions.SYSCONSOLE_READ_USERMANAGEMENT_SYSTEM_ROLES, Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_SYSTEM_ROLES],
    environment: [Permissions.SYSCONSOLE_READ_ENVIRONMENT, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT],
    site: [Permissions.SYSCONSOLE_READ_SITE, Permissions.SYSCONSOLE_WRITE_SITE],
    authentication: [Permissions.SYSCONSOLE_READ_AUTHENTICATION, Permissions.SYSCONSOLE_WRITE_AUTHENTICATION],
    plugins: [Permissions.SYSCONSOLE_READ_PLUGINS, Permissions.SYSCONSOLE_WRITE_PLUGINS],
    integrations: [Permissions.SYSCONSOLE_READ_INTEGRATIONS, Permissions.SYSCONSOLE_WRITE_INTEGRATIONS],
    compliance: [Permissions.SYSCONSOLE_READ_COMPLIANCE, Permissions.SYSCONSOLE_WRITE_COMPLIANCE],
    experimental: [Permissions.SYSCONSOLE_READ_EXPERIMENTAL, Permissions.SYSCONSOLE_WRITE_EXPERIMENTAL],
};