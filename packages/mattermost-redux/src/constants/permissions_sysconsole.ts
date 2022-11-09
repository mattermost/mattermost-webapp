// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Permissions from './permissions';

export const RESOURCE_KEYS = {
    ABOUT: {
        EDITION_AND_LICENSE: 'about.edition_and_license',
    },
    REPORTING: {
        SITE_STATISTICS: 'reporting.site_statistics',
        TEAM_STATISTICS: 'reporting.team_statistics',
        SERVER_LOGS: 'reporting.server_logs',
    },
    USER_MANAGEMENT: {
        USERS: 'user_management.users',
        GROUPS: 'user_management.groups',
        TEAMS: 'user_management.teams',
        CHANNELS: 'user_management.channels',
        PERMISSIONS: 'user_management.permissions',
        SYSTEM_ROLES: 'user_management.system_roles',
    },
    AUTHENTICATION: {
        SIGNUP: 'authentication.signup',
        EMAIL: 'authentication.email',
        PASSWORD: 'authentication.password',
        MFA: 'authentication.mfa',
        LDAP: 'authentication.ldap',
        SAML: 'authentication.saml',
        OPENID: 'authentication.openid',
        GUEST_ACCESS: 'authentication.guest_access',
    },
    INTEGRATIONS: {
        INTEGRATION_MANAGEMENT: 'integrations.integration_management',
        BOT_ACCOUNTS: 'integrations.bot_accounts',
        GIF: 'integrations.gif',
        CORS: 'integrations.cors',
    },
    COMPLIANCE: {
        DATA_RETENTION_POLICY: 'compliance.data_retention_policy',
        COMPLIANCE_EXPORT: 'compliance.compliance_export',
        COMPLIANCE_MONITORING: 'compliance.compliance_monitoring',
        CUSTOM_TERMS_OF_SERVICE: 'compliance.custom_terms_of_service',
    },
    PRODUCTS: {
        BOARDS: 'boards',
    },
    SITE: {
        CUSTOMIZATION: 'site.customization',
        LOCALIZATION: 'site.localization',
        USERS_AND_TEAMS: 'site.users_and_teams',
        NOTIFICATIONS: 'site.notifications',
        ANNOUNCEMENT_BANNER: 'site.announcement_banner',
        EMOJI: 'site.emoji',
        POSTS: 'site.posts',
        FILE_SHARING_AND_DOWNLOADS: 'site.file_sharing_and_downloads',
        PUBLIC_LINKS: 'site.public_links',
        NOTICES: 'site.notices',
    },
    EXPERIMENTAL: {
        FEATURES: 'experimental.features',
        FEATURE_FLAGS: 'experimental.feature_flags',
        BLEVE: 'experimental.bleve',
    },
    ENVIRONMENT: {
        WEB_SERVER: 'environment.web_server',
        DATABASE: 'environment.database',
        ELASTICSEARCH: 'environment.elasticsearch',
        FILE_STORAGE: 'environment.file_storage',
        IMAGE_PROXY: 'environment.image_proxy',
        SMTP: 'environment.smtp',
        PUSH_NOTIFICATION_SERVER: 'environment.push_notification_server',
        HIGH_AVAILABILITY: 'environment.high_availability',
        RATE_LIMITING: 'environment.rate_limiting',
        LOGGING: 'environment.logging',
        SESSION_LENGTHS: 'environment.session_lengths',
        PERFORMANCE_MONITORING: 'environment.performance_monitoring',
        DEVELOPER: 'environment.developer',
    },
};

export const ResourceToSysConsolePermissionsTable: Record<string, string[]> = {
    [RESOURCE_KEYS.ABOUT.EDITION_AND_LICENSE]: [Permissions.SYSCONSOLE_READ_ABOUT_EDITION_AND_LICENSE, Permissions.SYSCONSOLE_WRITE_ABOUT_EDITION_AND_LICENSE],
    billing: [Permissions.SYSCONSOLE_READ_BILLING, Permissions.SYSCONSOLE_WRITE_BILLING],
    [RESOURCE_KEYS.REPORTING.SITE_STATISTICS]: [Permissions.SYSCONSOLE_READ_REPORTING_SITE_STATISTICS, Permissions.SYSCONSOLE_WRITE_REPORTING_SITE_STATISTICS],
    [RESOURCE_KEYS.REPORTING.TEAM_STATISTICS]: [Permissions.SYSCONSOLE_READ_REPORTING_TEAM_STATISTICS, Permissions.SYSCONSOLE_WRITE_REPORTING_TEAM_STATISTICS],
    [RESOURCE_KEYS.REPORTING.SERVER_LOGS]: [Permissions.SYSCONSOLE_READ_REPORTING_SERVER_LOGS, Permissions.SYSCONSOLE_WRITE_REPORTING_SERVER_LOGS],
    [RESOURCE_KEYS.USER_MANAGEMENT.USERS]: [Permissions.SYSCONSOLE_READ_USERMANAGEMENT_USERS, Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_USERS],
    [RESOURCE_KEYS.USER_MANAGEMENT.GROUPS]: [Permissions.SYSCONSOLE_READ_USERMANAGEMENT_GROUPS, Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_GROUPS],
    [RESOURCE_KEYS.USER_MANAGEMENT.TEAMS]: [Permissions.SYSCONSOLE_READ_USERMANAGEMENT_TEAMS, Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_TEAMS],
    [RESOURCE_KEYS.USER_MANAGEMENT.CHANNELS]: [Permissions.SYSCONSOLE_READ_USERMANAGEMENT_CHANNELS, Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_CHANNELS],
    [RESOURCE_KEYS.USER_MANAGEMENT.PERMISSIONS]: [Permissions.SYSCONSOLE_READ_USERMANAGEMENT_PERMISSIONS, Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_PERMISSIONS],
    [RESOURCE_KEYS.USER_MANAGEMENT.SYSTEM_ROLES]: [Permissions.SYSCONSOLE_READ_USERMANAGEMENT_SYSTEM_ROLES, Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_SYSTEM_ROLES],
    [RESOURCE_KEYS.SITE.CUSTOMIZATION]: [Permissions.SYSCONSOLE_READ_SITE_CUSTOMIZATION, Permissions.SYSCONSOLE_WRITE_SITE_CUSTOMIZATION],
    [RESOURCE_KEYS.SITE.LOCALIZATION]: [Permissions.SYSCONSOLE_READ_SITE_LOCALIZATION, Permissions.SYSCONSOLE_WRITE_SITE_LOCALIZATION],
    [RESOURCE_KEYS.SITE.USERS_AND_TEAMS]: [Permissions.SYSCONSOLE_READ_SITE_USERS_AND_TEAMS, Permissions.SYSCONSOLE_WRITE_SITE_USERS_AND_TEAMS],
    [RESOURCE_KEYS.SITE.NOTIFICATIONS]: [Permissions.SYSCONSOLE_READ_SITE_NOTIFICATIONS, Permissions.SYSCONSOLE_WRITE_SITE_NOTIFICATIONS],
    [RESOURCE_KEYS.SITE.ANNOUNCEMENT_BANNER]: [Permissions.SYSCONSOLE_READ_SITE_ANNOUNCEMENT_BANNER, Permissions.SYSCONSOLE_WRITE_SITE_ANNOUNCEMENT_BANNER],
    [RESOURCE_KEYS.SITE.EMOJI]: [Permissions.SYSCONSOLE_READ_SITE_EMOJI, Permissions.SYSCONSOLE_WRITE_SITE_EMOJI],
    [RESOURCE_KEYS.SITE.POSTS]: [Permissions.SYSCONSOLE_READ_SITE_POSTS, Permissions.SYSCONSOLE_WRITE_SITE_POSTS],
    [RESOURCE_KEYS.SITE.FILE_SHARING_AND_DOWNLOADS]: [Permissions.SYSCONSOLE_READ_SITE_FILE_SHARING_AND_DOWNLOADS, Permissions.SYSCONSOLE_WRITE_SITE_FILE_SHARING_AND_DOWNLOADS],
    [RESOURCE_KEYS.SITE.PUBLIC_LINKS]: [Permissions.SYSCONSOLE_READ_SITE_PUBLIC_LINKS, Permissions.SYSCONSOLE_WRITE_SITE_PUBLIC_LINKS],
    [RESOURCE_KEYS.SITE.NOTICES]: [Permissions.SYSCONSOLE_READ_SITE_NOTICES, Permissions.SYSCONSOLE_WRITE_SITE_NOTICES],
    [RESOURCE_KEYS.ENVIRONMENT.WEB_SERVER]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_WEB_SERVER, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_WEB_SERVER],
    [RESOURCE_KEYS.ENVIRONMENT.DATABASE]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_DATABASE, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_DATABASE],
    [RESOURCE_KEYS.ENVIRONMENT.ELASTICSEARCH]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_ELASTICSEARCH, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_ELASTICSEARCH],
    [RESOURCE_KEYS.ENVIRONMENT.FILE_STORAGE]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_FILE_STORAGE, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_FILE_STORAGE],
    [RESOURCE_KEYS.ENVIRONMENT.IMAGE_PROXY]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_IMAGE_PROXY, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_IMAGE_PROXY],
    [RESOURCE_KEYS.ENVIRONMENT.SMTP]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_SMTP, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_SMTP],
    [RESOURCE_KEYS.ENVIRONMENT.PUSH_NOTIFICATION_SERVER]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_PUSH_NOTIFICATION_SERVER, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_PUSH_NOTIFICATION_SERVER],
    [RESOURCE_KEYS.ENVIRONMENT.HIGH_AVAILABILITY]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_HIGH_AVAILABILITY, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_HIGH_AVAILABILITY],
    [RESOURCE_KEYS.ENVIRONMENT.RATE_LIMITING]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_RATE_LIMITING, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_RATE_LIMITING],
    [RESOURCE_KEYS.ENVIRONMENT.LOGGING]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_LOGGING, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_LOGGING],
    [RESOURCE_KEYS.ENVIRONMENT.SESSION_LENGTHS]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_SESSION_LENGTHS, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_SESSION_LENGTHS],
    [RESOURCE_KEYS.ENVIRONMENT.PERFORMANCE_MONITORING]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_PERFORMANCE_MONITORING, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_PERFORMANCE_MONITORING],
    [RESOURCE_KEYS.ENVIRONMENT.DEVELOPER]: [Permissions.SYSCONSOLE_READ_ENVIRONMENT_DEVELOPER, Permissions.SYSCONSOLE_WRITE_ENVIRONMENT_DEVELOPER],
    [RESOURCE_KEYS.AUTHENTICATION.SIGNUP]: [Permissions.SYSCONSOLE_READ_AUTHENTICATION_SIGNUP, Permissions.SYSCONSOLE_WRITE_AUTHENTICATION_SIGNUP],
    [RESOURCE_KEYS.AUTHENTICATION.EMAIL]: [Permissions.SYSCONSOLE_READ_AUTHENTICATION_EMAIL, Permissions.SYSCONSOLE_WRITE_AUTHENTICATION_EMAIL],
    [RESOURCE_KEYS.AUTHENTICATION.PASSWORD]: [Permissions.SYSCONSOLE_READ_AUTHENTICATION_PASSWORD, Permissions.SYSCONSOLE_WRITE_AUTHENTICATION_PASSWORD],
    [RESOURCE_KEYS.AUTHENTICATION.MFA]: [Permissions.SYSCONSOLE_READ_AUTHENTICATION_MFA, Permissions.SYSCONSOLE_WRITE_AUTHENTICATION_MFA],
    [RESOURCE_KEYS.AUTHENTICATION.LDAP]: [Permissions.SYSCONSOLE_READ_AUTHENTICATION_LDAP, Permissions.SYSCONSOLE_WRITE_AUTHENTICATION_LDAP],
    [RESOURCE_KEYS.AUTHENTICATION.SAML]: [Permissions.SYSCONSOLE_READ_AUTHENTICATION_SAML, Permissions.SYSCONSOLE_WRITE_AUTHENTICATION_SAML],
    [RESOURCE_KEYS.AUTHENTICATION.OPENID]: [Permissions.SYSCONSOLE_READ_AUTHENTICATION_OPENID, Permissions.SYSCONSOLE_WRITE_AUTHENTICATION_OPENID],
    [RESOURCE_KEYS.AUTHENTICATION.GUEST_ACCESS]: [Permissions.SYSCONSOLE_READ_AUTHENTICATION_GUEST_ACCESS, Permissions.SYSCONSOLE_WRITE_AUTHENTICATION_GUEST_ACCESS],
    plugins: [Permissions.SYSCONSOLE_READ_PLUGINS, Permissions.SYSCONSOLE_WRITE_PLUGINS],
    [RESOURCE_KEYS.INTEGRATIONS.INTEGRATION_MANAGEMENT]: [Permissions.SYSCONSOLE_READ_INTEGRATIONS_INTEGRATION_MANAGEMENT, Permissions.SYSCONSOLE_WRITE_INTEGRATIONS_INTEGRATION_MANAGEMENT],
    [RESOURCE_KEYS.PRODUCTS.BOARDS]: [Permissions.SYSCONSOLE_READ_PRODUCTS_BOARDS, Permissions.SYSCONSOLE_WRITE_PRODUCTS_BOARDS],
    [RESOURCE_KEYS.INTEGRATIONS.BOT_ACCOUNTS]: [Permissions.SYSCONSOLE_READ_INTEGRATIONS_BOT_ACCOUNTS, Permissions.SYSCONSOLE_WRITE_INTEGRATIONS_BOT_ACCOUNTS],
    [RESOURCE_KEYS.INTEGRATIONS.GIF]: [Permissions.SYSCONSOLE_READ_INTEGRATIONS_GIF, Permissions.SYSCONSOLE_WRITE_INTEGRATIONS_GIF],
    [RESOURCE_KEYS.INTEGRATIONS.CORS]: [Permissions.SYSCONSOLE_READ_INTEGRATIONS_CORS, Permissions.SYSCONSOLE_WRITE_INTEGRATIONS_CORS],
    [RESOURCE_KEYS.COMPLIANCE.DATA_RETENTION_POLICY]: [Permissions.SYSCONSOLE_READ_COMPLIANCE_DATA_RETENTION_POLICY, Permissions.SYSCONSOLE_WRITE_COMPLIANCE_DATA_RETENTION_POLICY],
    [RESOURCE_KEYS.COMPLIANCE.COMPLIANCE_EXPORT]: [Permissions.SYSCONSOLE_READ_COMPLIANCE_COMPLIANCE_EXPORT, Permissions.SYSCONSOLE_WRITE_COMPLIANCE_COMPLIANCE_EXPORT],
    [RESOURCE_KEYS.COMPLIANCE.COMPLIANCE_MONITORING]: [Permissions.SYSCONSOLE_READ_COMPLIANCE_COMPLIANCE_MONITORING, Permissions.SYSCONSOLE_WRITE_COMPLIANCE_COMPLIANCE_MONITORING],
    [RESOURCE_KEYS.COMPLIANCE.CUSTOM_TERMS_OF_SERVICE]: [Permissions.SYSCONSOLE_READ_COMPLIANCE_CUSTOM_TERMS_OF_SERVICE, Permissions.SYSCONSOLE_WRITE_COMPLIANCE_CUSTOM_TERMS_OF_SERVICE],
    [RESOURCE_KEYS.EXPERIMENTAL.FEATURES]: [Permissions.SYSCONSOLE_READ_EXPERIMENTAL_FEATURES, Permissions.SYSCONSOLE_WRITE_EXPERIMENTAL_FEATURES],
    [RESOURCE_KEYS.EXPERIMENTAL.FEATURE_FLAGS]: [Permissions.SYSCONSOLE_READ_EXPERIMENTAL_FEATURE_FLAGS, Permissions.SYSCONSOLE_WRITE_EXPERIMENTAL_FEATURE_FLAGS],
    [RESOURCE_KEYS.EXPERIMENTAL.BLEVE]: [Permissions.SYSCONSOLE_READ_EXPERIMENTAL_BLEVE, Permissions.SYSCONSOLE_WRITE_EXPERIMENTAL_BLEVE],
};
