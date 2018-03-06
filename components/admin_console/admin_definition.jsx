import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';
import {invalidateAllCaches, reloadConfig} from 'actions/admin_actions';

import {CONNECTION_SECURITY_HELP_TEXT_WEBSERVER, WEBSERVER_MODE_HELP_TEXT} from './admin_definition_constants';

export default {
    reporting: {
    },
    settings: {
        general: {
            configuration: {
                schema: {
                    id: 'ServiceSettings',
                    name: 'admin.general.configuration',
                    name_default: 'Configuration',
                    settings: [
                        {
                            type: Constants.SettingsTypes.TYPE_BANNER,
                            label: 'admin.rate.noteDescription',
                            label_default: 'Changing properties other than Site URL in this section will require a server restart before taking effect.',
                            banner_type: 'info',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_TEXT,
                            key: 'SiteURL',
                            label: 'admin.service.siteURL',
                            label_default: 'Site URL:',
                            help_text: 'admin.service.siteURLDescription',
                            help_text_default: 'The URL that users will use to access Mattermost. Standard ports, such as 80 and 443, can be omitted, but non-standard ports are required. For example: http://mattermost.example.com:8065. This setting is required.',
                            placeholder: 'admin.service.siteURLExample',
                            placeholder_default: 'Ex "https://mattermost.example.com:1234"',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_TEXT,
                            key: 'ListenAddress',
                            label: 'admin.service.listenAddress',
                            label_default: 'Listen Address:',
                            placeholder: 'admin.service.listenExample',
                            placeholder_default: 'Ex ":8065"',
                            help_text: 'admin.service.listenDescription',
                            help_text_default: 'The address and port to which to bind and listen. Specifying ":8065" will bind to all network interfaces. Specifying "127.0.0.1:8065" will only bind to the network interface having that IP address. If you choose a port of a lower level (called "system ports" or "well-known ports", in the range of 0-1023), you must have permissions to bind to that port. On Linux you can use: "sudo setcap cap_net_bind_service=+ep ./bin/platform" to allow Mattermost to bind to well-known ports.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_DROPDOWN,
                            key: 'ConnectionSecurity',
                            label: 'admin.connectionSecurityTitle',
                            label_default: 'Connection Security:',
                            help_text: CONNECTION_SECURITY_HELP_TEXT_WEBSERVER,
                            options: [
                                {
                                    value: '',
                                    display_name: 'admin.connectionSecurityNone',
                                    display_name_default: 'None',
                                },
                                {
                                    value: 'TLS',
                                    display_name: 'admin.connectionSecurityTls',
                                    display_name_default: 'TLS (Recommended)',
                                },
                            ],
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_TEXT,
                            key: 'TLSCertFile',
                            label: 'admin.service.tlsCertFile',
                            label_default: 'TLS Certificate File:',
                            help_text: 'admin.service.tlsCertFileDescription',
                            help_text_defalt: 'The certificate file to use.',
                            needs: [['UseLetsEncrypt', false]],
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_TEXT,
                            key: 'TLSKeyFile',
                            label: 'admin.service.tlsKeyFile',
                            label_default: 'TLS Key File:',
                            help_text: 'admin.service.tlsKeyFileDescription',
                            help_text_default: 'The private key file to use.',
                            needs: [['UseLetsEncrypt', false]],
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'UseLetsEncrypt',
                            label: 'admin.service.useLetsEncrypt',
                            label_default: 'Use Let\'s Encrypt:',
                            help_text: 'admin.service.useLetsEncryptDescription',
                            help_text_default: 'Enable the automatic retreval of certificates from the Let\'s Encrypt. The certificate will be retrieved when a client attempts to connect from a new domain. This will work with multiple domains.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_TEXT,
                            key: 'LetsEncryptCertificateCacheFile',
                            label: 'admin.service.letsEncryptCertificateCacheFile',
                            label_default: 'Let\'s Encrypt Certificate Cache File:',
                            help_text: 'admin.service.letsEncryptCertificateCacheFileDescription',
                            help_text_default: 'Certificates retrieved and other data about the Let\'s Encrypt service will be stored in this file.',
                            needs: [['UseLetsEncrypt', true]],
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_TEXT,
                            key: 'Forward80To443',
                            label: 'admin.service.forward80To443',
                            label_default: 'Forward port 80 to 443:',
                            help_text: 'admin.service.forward80To443Description',
                            help_text_default: 'Forwards all insecure traffic from port 80 to secure port 443',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_NUMBER,
                            key: 'ReadTimeout',
                            label: 'admin.service.readTimeout',
                            label_default: 'Read Timeout:',
                            help_text: 'admin.service.readTimeoutDescription',
                            help_text_default: 'Maximum time allowed from when the connection is accepted to when the request body is fully read.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_NUMBER,
                            key: 'WriteTimeout',
                            label: 'admin.service.writeTimeout',
                            label_default: 'Write Timeout:',
                            help_text: 'admin.service.writeTimeoutDescription',
                            help_text_default: 'If using HTTP (insecure), this is the maximum time allowed from the end of reading the request headers until the response is written. If using HTTPS, it is the total time from when the connection is accepted until the response is written.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableAPIv3',
                            label: 'admin.service.enableAPIv3',
                            label_default: 'Allow use of API v3 endpoints:',
                            help_text: 'admin.service.enableAPIv3Description',
                            help_text_default: 'Set to false to disable all version 3 endpoints of the REST API. Integrations that rely on API v3 will fail and can then be identified for migration to API v4. API v3 is deprecated and will be removed in the near future. See <a href="https://api.mattermost.com" target="_blank">https://api.mattermost.com</a> for details.',
                            help_text_html: true,
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_DROPDOWN,
                            key: 'WebserverMode',
                            label: 'admin.webserverModeTitle',
                            label_default: 'Webserver Mode:',
                            help_text: WEBSERVER_MODE_HELP_TEXT,
                            options: [
                                {
                                    value: 'gzip',
                                    display_name: 'admin.webserverModeGzip',
                                    display_name_default: 'gzip',
                                },
                                {
                                    value: 'uncompressed',
                                    display_name: 'admin.webserverModeUncompressed',
                                    display_name_default: 'Uncompressed',
                                },
                                {
                                    value: 'disabled',
                                    display_name: 'admin.webserverModeDisabled',
                                    display_name_default: 'Disabled',
                                },
                            ],
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BUTTON,
                            action: reloadConfig,
                            key: 'ReloadConfigButton',
                            label: 'admin.reload.button',
                            label_default: 'Reload Configuration From Disk',
                            help_text: 'admin.reload.reloadDescription',
                            help_text_default: 'Deployments using multiple databases can switch from one master database to another without restarting the Mattermost server by updating "config.json" to the new desired configuration and using the {featureName} feature to load the new settings while the server is running. The administrator should then use the {recycleDatabaseConnections} feature to recycle the database connections based on the new settings.',
                            help_text_values: {
                                featureName: (
                                    <b>
                                        <FormattedMessage
                                            id='admin.reload.reloadDescription.featureName'
                                            defaultMessage='Reload Configuration from Disk'
                                        />
                                    </b>
                                ),
                                recycleDatabaseConnections: (
                                    <a href='../advanced/database'>
                                        <b>
                                            <FormattedMessage
                                                id='admin.reload.reloadDescription.recycleDatabaseConnections'
                                                defaultMessage='Database > Recycle Database Connections'
                                            />
                                        </b>
                                    </a>
                                ),
                            },
                            error_message: 'admin.reload.reloadFail',
                            error_message_default: 'Reload unsuccessful: {error}',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BUTTON,
                            key: 'PurgeButton',
                            action: invalidateAllCaches,
                            label: 'admin.purge.button',
                            label_default: 'Purge All Caches',
                            help_text: 'admin.purge.purgeDescription',
                            help_text_default: 'This will purge all the in-memory caches for things like sessions, accounts, channels, etc. Deployments using High Availability will attempt to purge all the servers in the cluster.  Purging the caches may adversely impact performance.',
                            error_message: 'admin.purge.purgeFail',
                            error_message_default: 'Purging unsuccessful: {error}',
                        },
                    ],
                },
            },
            localization: {
                schema: {
                    id: 'LocalizationSettings',
                    name: 'admin.general.localization',
                    name_default: 'Localization',
                    settings: [
                        {
                            type: Constants.SettingsTypes.TYPE_LANGUAGE,
                            key: 'DefaultServerLocale',
                            label: 'admin.general.localization.serverLocaleTitle',
                            label_default: 'Default Server Language:',
                            help_text: 'admin.general.localization.serverLocaleDescription',
                            help_text_default: 'Default language for system messages and logs. Changing this will require a server restart before taking effect.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_LANGUAGE,
                            key: 'DefaultClientLocale',
                            label: 'admin.general.localization.clientLocaleTitle',
                            label_default: 'Default Client Language:',
                            help_text: 'admin.general.localization.clientLocaleDescription',
                            help_text_default: 'Default language for newly created users and pages where the user hasn\'t logged in.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_LANGUAGE,
                            key: 'AvailableLocales',
                            label: 'admin.general.localization.availableLocalesTitle',
                            label_default: 'Available Languages:',
                            help_text: 'admin.general.localization.availableLocalesDescription',
                            help_text_html: true,
                            help_text_default: 'Set which languages are available for users in Account Settings (leave this field blank to have all supported languages available). If you’re manually adding new languages, the <strong>Default Client Language</strong> must be added before saving this setting.<br /><br />Would like to help with translations? Join the <a href="http://translate.mattermost.com/" target="_blank">Mattermost Translation Server</a> to contribute.',
                            multiple: true,
                            no_result: 'admin.general.localization.availableLocalesNoResults',
                            no_result_default: 'No results found',
                            not_present: 'admin.general.localization.availableLocalesNotPresent',
                            not_present_default: 'The default client language must be included in the available list',
                        },
                    ],
                },
            },
            users_and_teams: {
                schema: {
                    id: 'TeamSettings',
                    name: 'admin.general.usersAndTeams',
                    name_default: 'Users and Teams',
                    settings: [
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableUserCreation',
                            label: 'admin.team.userCreationTitle',
                            label_default: 'Enable Account Creation:',
                            help_text: 'admin.team.userCreationDescription',
                            help_text_default: 'When false, the ability to create accounts is disabled. The create account button displays error when pressed.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableTeamCreation',
                            label: 'admin.team.teamCreationTitle',
                            label_default: 'Enable Team Creation:',
                            help_text: 'admin.team.teamCreationDescription',
                            help_text_default: 'When false, only System Administrators can create teams.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_NUMBER,
                            key: 'MaxUsersPerTeam',
                            label: 'admin.team.maxUsersTitle',
                            label_default: 'Max Users Per Team:',
                            placeholder: 'admin.team.maxUsersExample',
                            placeholder_default: 'Ex "25"',
                            help_text: 'admin.team.maxUsersDescription',
                            help_text_default: 'Maximum total number of users per team, including both active and inactive users.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_NUMBER,
                            key: 'MaxChannelsPerTeam',
                            label: 'admin.team.maxChannelsTitle',
                            label_default: 'Max Channels Per Team:',
                            placeholder: 'admin.team.maxChannelsExample',
                            placeholder_default: 'Ex "100"',
                            help_text: 'admin.team.maxChannelsDescription',
                            help_text_default: 'Maximum total number of channels per team, including both active and deleted channels.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_NUMBER,
                            key: 'MaxNotificationsPerChannel',
                            label: 'admin.team.maxNotificationsPerChannelTitle',
                            label_default: 'Max Notifications Per Channel:',
                            placeholder: 'admin.team.maxNotificationsPerChannelExample',
                            placeholder_default: 'Ex "1000"',
                            help_text: 'admin.team.maxNotificationsPerChannelDescription',
                            help_text_default: 'Maximum total number of users in a channel before users typing messages, @all, @here, and @channel no longer send notifications because of performance.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableConfirmNotificationsToChannel',
                            label: 'admin.team.enableConfirmNotificationsToChannelTitle',
                            label_default: 'Show @channel and @all confirmation dialog:',
                            help_text: 'admin.team.enableConfirmNotificationsToChannelDescription',
                            help_text_default: 'When true, users will be prompted to confirm when posting @channel and @all in channels with over five members. When false, no confirmation is required.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_TEXT,
                            key: 'RestrictCreationToDomains',
                            label: 'admin.team.restrictTitle',
                            label_default: 'Restrict account creation to specified email domains:',
                            help_text: 'admin.team.restrictDescription',
                            help_text_default: 'Teams and user accounts can only be created from a specific domain (e.g. "mattermost.org") or list of comma-separated domains (e.g. "corp.mattermost.com, mattermost.org").',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_DROPDOWN,
                            key: 'RestrictDirectMessage',
                            label: 'admin.team.restrictDirectMessage',
                            label_default: 'Enable users to open Direct Message channels with:',
                            help_text: 'admin.team.restrictDirectMessageDesc',
                            help_text_default: '"Any user on the Mattermost server" enables users to open a Direct Message channel with any user on the server, even if they are not on any teams together. "Any member of the team" limits the ability to open Direct Message channels to only users who are in the same team.',
                            options: [
                                {
                                    value: 'any',
                                    display_name: 'admin.team.restrict_direct_message_any',
                                    display_name_default: 'Any user on the Mattermost server',
                                },
                                {
                                    value: 'team',
                                    display_name: 'admin.team.restrict_direct_message_team',
                                    display_name_default: 'Any member of the team',
                                },
                            ],
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_DROPDOWN,
                            key: 'TeammateNameDisplay',
                            label: 'admin.team.teammateNameDisplay',
                            label_default: 'Teammate Name Display:',
                            help_text: 'admin.team.teammateNameDisplayDesc',
                            help_text_default: 'Set how to display users\' names in posts and the Direct Messages list.',
                            options: [
                                {
                                    value: Constants.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME,
                                    display_name: 'admin.team.showUsername',
                                    display_name_default: 'Show username (default)',
                                },
                                {
                                    value: Constants.TEAMMATE_NAME_DISPLAY.SHOW_NICKNAME_FULLNAME,
                                    display_name: 'admin.team.showNickname',
                                    display_name_default: 'Show nickname if one exists, otherwise show first and last name',
                                },
                                {
                                    value: Constants.TEAMMATE_NAME_DISPLAY.SHOW_FULLNAME,
                                    display_name: 'admin.team.showFullname',
                                    display_name_default: 'Show first and last name',
                                },
                            ],
                        },
                    ],
                },
            },
            privacy: {
                schema: {
                    id: 'PrivacySettings',
                    name: 'admin.general.privacy',
                    name_default: 'Privacy',
                    settings: [
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'ShowEmailAddress',
                            label: 'admin.privacy.showEmailTitle',
                            label_default: 'Show Email Address:',
                            help_text: 'admin.privacy.showEmailDescription',
                            help_text_default: 'When false, hides the email address of members from everyone except System Administrators.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'ShowFullName',
                            label: 'admin.privacy.showFullNameTitle',
                            label_default: 'Show Full Name:',
                            help_text: 'admin.privacy.showFullNameDescription',
                            help_text_default: 'When false, hides the full name of members from everyone except System Administrators. Username is shown in place of full name.',
                        },
                    ],
                },
            },
            compliance: {
                schema: {
                    id: 'ComplianceSettings',
                    name: 'admin.compliance.title',
                    name_default: 'Compliance Settings',
                    settings: [
                        {
                            type: Constants.SettingsTypes.TYPE_BANNER,
                            label: 'admin.compliance.noLicense',
                            label_default: '<h4 class="banner__heading">Note:</h4><p>Compliance is an enterprise feature. Your current license does not support Compliance. Click <a href="http://mattermost.com"target="_blank">here</a> for information and pricing on enterprise licenses.</p>',
                            needs_no_license: true,
                            banner_type: 'warning',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'Enable',
                            label: 'admin.compliance.enableTitle',
                            label_default: 'Enable Compliance Reporting:',
                            help_text: 'admin.compliance.enableDesc',
                            help_text_default: 'When true, Mattermost allows compliance reporting from the <strong>Compliance and Auditing</strong> tab. See <a href="https://docs.mattermost.com/administration/compliance.html" target="_blank">documentation</a> to learn more.',
                            help_text_html: true,
                            needs_license: true,
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_TEXT,
                            key: 'Directory',
                            label: 'admin.compliance.directoryTitle',
                            label_default: 'Compliance Report Directory:',
                            help_text: 'admin.compliance.directoryDescription',
                            help_text_default: 'Directory to which compliance reports are written. If blank, will be set to ./data/.',
                            placeholder: 'admin.sql.maxOpenExample',
                            placeholder_default: 'Ex "10"',
                            needs: [['Enable', true]],
                            needs_license: true,
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableDaily',
                            label: 'admin.compliance.enableDailyTitle',
                            label_default: 'Enable Daily Report:',
                            help_text: 'admin.compliance.enableDailyDesc',
                            help_text_default: 'When true, Mattermost will generate a daily compliance report.',
                            needs: [['Enable', true]],
                            needs_license: true,
                        },
                    ],
                },
            },
        },
        authentication: {
            email: {
                schema: {
                    id: 'EmailSettings',
                    name: 'admin.authentication.email',
                    name_default: 'Email Authentication',
                    settings: [
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableSignUpWithEmail',
                            label: 'admin.email.allowSignupTitle',
                            label_default: 'Enable account creation with email:',
                            help_text: 'admin.email.allowSignupDescription',
                            help_text_default: 'When true, Mattermost allows account creation using email and password. This value should be false only when you want to limit sign up to a single sign-on service like AD/LDAP, SAML or GitLab.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableSignInWithEmail',
                            label: 'admin.email.allowEmailSignInTitle',
                            label_default: 'Enable sign-in with email:',
                            help_text: 'admin.email.allowEmailSignInDescription',
                            help_text_default: 'When true, Mattermost allows users to sign in using their email and password.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableSignInWithUsername',
                            label: 'admin.email.allowUsernameSignInTitle',
                            label_default: 'Enable sign-in with username:',
                            help_text: 'admin.email.allowUsernameSignInDescription',
                            help_text_default: 'When true, users with email login can sign in using their username and password. This setting does not affect AD/LDAP login.',
                        },
                    ],
                },
            },
            mfa: {
                schema: {
                    id: 'ServiceSettings',
                    name: 'admin.mfa.title',
                    name_default: 'Multi-factor Authentication',
                    settings: [
                        {
                            type: Constants.SettingsTypes.TYPE_BANNER,
                            label: 'admin.mfa.bannerDesc',
                            label_default: '<a href=\'https://docs.mattermost.com/deployment/auth.html\' target=\'_blank\'>Multi-factor authentication</a> is available for accounts with AD/LDAP or email login. If other login methods are used, MFA should be configured with the authentication provider.',
                            label_html: true,
                            banner_type: 'info',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableMultifactorAuthentication',
                            label: 'admin.service.mfaTitle',
                            label_default: 'Enable Multi-factor Authentication:',
                            help_text: 'admin.service.mfaDesc',
                            help_text_default: 'When true, users with AD/LDAP or email login can add multi-factor authentication to their account using Google Authenticator.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnforceMultifactorAuthentication',
                            label: 'admin.service.enforceMfaTitle',
                            label_default: 'Enforce Multi-factor Authentication:',
                            help_text: 'admin.service.enforceMfaDesc',
                            help_text_html: true,
                            help_text_default: 'When true, <a href=\'https://docs.mattermost.com/deployment/auth.html\' target=\'_blank\'>multi-factor authentication</a> is required for login. New users will be required to configure MFA on signup. Logged in users without MFA configured are redirected to the MFA setup page until configuration is complete.<br/><br/>If your system has users with login methods other than AD/LDAP and email, MFA must be enforced with the authentication provider outside of Mattermost.',
                            needs: [['EnableMultifactorAuthentication', true]],
                        },
                    ],
                },
            },
        },
        security: {
        },
        notifications: {
        },
        integrations: {
        },
        plugins: {
        },
        files: {
        },
        customization: {
        },
        compliance: {
        },
        advanced: {
        },
    },
    other: {
    },
};
