// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';
import {invalidateAllCaches, reloadConfig} from 'actions/admin_actions';
import SystemAnalytics from 'components/analytics/system_analytics';
import TeamAnalytics from 'components/analytics/team_analytics';

import SystemUsers from './system_users';
import ServerLogs from './server_logs';
import Audits from './audits';
import LicenseSettings from './license_settings';

import * as DefinitionConstants from './admin_definition_constants';

// admin_definitions data structure define the autogenerated admin_console
// section. It defines the structure of the menu based on sections, subsections
// and pages. Each page contains an schema which defines a component to use for
// render the entire section or the name of the section (name and
// name_default), the section in the config file (id), and a list of options to
// configure (settings).
//
// All text fiels contains a transation key, and the <field>_default string are the
// default text when the translation is still not avaiable (the english version
// of the text).
//
// We can define different types of settings configuration widgets:
//
// Widget:
//   - type: which define the widget type.
//   - label (and label_default): which define the main text of the setting.
//   - needs: a list of pairs of [field, value] to enable/disable the field.
//   - needs_license: True if need to have license to be shown.
//   - needs_no_license: True if need to have not license to be shown.
//
// Custom Widget (extends from Widget):
//   - component: The component used to render the widget
//
// Banner Widget (extends from Widget):
//   - banner_type: The type of banner (options: info or warning)
//
// Setting Widget (extends from Widget):
//   - key: The key to store the configuration in the config file.
//   - help_text (and help_text_default): Long description of the field.
//   - help_text_html: True if the translation text contains html.
//   - help_text_values: Values to fill the translation (if needed).
//
// Bool Widget (extends from Setting Widget)
//
// Number Widget (extends from Setting Widget)
//
// Text Widget (extends from Setting Widget)
//   - placeholder (and placeholder_default): Placeholder text to show in the input.
//
// Button Widget (extends from Setting Widget)
//   - action: A redux action to execute on click.
//   - error_message (and error_message_default): Error to show if action doesn't work.
//
// Language Widget (extends from Setting Widget)
//   - multiple: If you can select multiple languages.
//   - no_result (and no_result_default): Text to show on not results found (only for multiple = true).
//   - not_present (and not_present_default): Text to show when the default language is not present (only for multiple = true).
//
// Dropdown Widget (extends from Setting Widget)
//   - options: List of options of the dropdown (each options has value, display_name and display_name_default fields).

export default {
    reporting: {
        system_analytics: {
            schema: {
                id: 'SystemAnalytics',
                component: SystemAnalytics,
            },
        },
        team_analytics: {
            schema: {
                id: 'TeamAnalytics',
                component: TeamAnalytics,
            },
        },
        system_users: {
            schema: {
                id: 'SystemUsers',
                component: SystemUsers,
            },
        },
        server_logs: {
            schema: {
                id: 'ServerLogs',
                component: ServerLogs,
            },
        },
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
                            placeholder_default: 'E.g.: "https://mattermost.example.com:1234"',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_TEXT,
                            key: 'ListenAddress',
                            label: 'admin.service.listenAddress',
                            label_default: 'Listen Address:',
                            placeholder: 'admin.service.listenExample',
                            placeholder_default: 'E.g.: ":8065"',
                            help_text: 'admin.service.listenDescription',
                            help_text_default: 'The address and port to which to bind and listen. Specifying ":8065" will bind to all network interfaces. Specifying "127.0.0.1:8065" will only bind to the network interface having that IP address. If you choose a port of a lower level (called "system ports" or "well-known ports", in the range of 0-1023), you must have permissions to bind to that port. On Linux you can use: "sudo setcap cap_net_bind_service=+ep ./bin/platform" to allow Mattermost to bind to well-known ports.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'Forward80To443',
                            label: 'admin.service.forward80To443',
                            label_default: 'Forward port 80 to 443:',
                            help_text: 'admin.service.forward80To443Description',
                            help_text_default: 'Forwards all insecure traffic from port 80 to secure port 443. Not recommended when using a proxy server.',
                            disabled_help_text: 'admin.service.forward80To443Description.disabled',
                            disabled_help_text_default: 'Forwards all insecure traffic from port 80 to secure port 443. Not recommended when using a proxy server.<br /><br />This setting cannot be enabled until your server is <a href="#ListenAddress">listening</a> on port 443.',
                            disabled_help_text_html: true,
                            needs: [['ListenAddress', /:443$/]],
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_DROPDOWN,
                            key: 'ConnectionSecurity',
                            label: 'admin.connectionSecurityTitle',
                            label_default: 'Connection Security:',
                            help_text: DefinitionConstants.CONNECTION_SECURITY_HELP_TEXT_WEBSERVER,
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
                            help_text_default: 'The certificate file to use.',
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
                            help_text_default: 'Enable the automatic retrieval of certificates from Let\'s Encrypt. The certificate will be retrieved when a client attempts to connect from a new domain. This will work with multiple domains.',
                            disabled_help_text: 'admin.service.useLetsEncryptDescription.disabled',
                            disabled_help_text_default: 'Enable the automatic retrieval of certificates from Let\'s Encrypt. The certificate will be retrieved when a client attempts to connect from a new domain. This will work with multiple domains.<br /><br />This setting cannot be enabled unless the <a href="#Forward80To443">Forward port 80 to 443</a> setting is set to true.',
                            disabled_help_text_html: true,
                            needs: [['Forward80To443', true]],
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
                            help_text: DefinitionConstants.WEBSERVER_MODE_HELP_TEXT,
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
                            placeholder_default: 'E.g.: "10"',
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
            logging: {
                schema: {
                    id: 'LogSettings',
                    name: 'admin.general.log',
                    name_default: 'Logging',
                    settings: [
                        {
                            type: Constants.SettingsTypes.TYPE_BANNER,
                            label: 'admin.log.noteDescription',
                            label_default: 'Changing properties other than <a href="#EnableWebhookDebugging">Enable Webhook Debugging</a> and <a href="#EnableDiagnostics">Enable Diagnostics and Error Reporting</a> in this section will require a server restart before taking effect.',
                            label_html: true,
                            banner_type: 'info',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableConsole',
                            label: 'admin.log.consoleTitle',
                            label_default: 'Output logs to console: ',
                            help_text: 'admin.log.consoleDescription',
                            help_text_default: 'Typically set to false in production. Developers may set this field to true to output log messages to console based on the console level option.  If true, server writes messages to the standard output stream (stdout).',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_DROPDOWN,
                            key: 'ConsoleLevel',
                            label: 'admin.log.levelTitle',
                            label_default: 'Console Log Level:',
                            help_text: 'admin.log.levelDescription',
                            help_text_default: 'This setting determines the level of detail at which log events are written to the console. ERROR: Outputs only error messages. INFO: Outputs error messages and information around startup and initialization. DEBUG: Prints high detail for developers working on debugging issues.',
                            options: DefinitionConstants.LOG_LEVEL_OPTIONS,
                            needs: [['EnableConsole', true]],
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableFile',
                            label: 'admin.log.fileTitle',
                            label_default: 'Output logs to file: ',
                            help_text: 'admin.log.fileDescription',
                            help_text_default: 'Typically set to true in production. When true, logged events are written to the mattermost.log file in the directory specified in the File Log Directory field. The logs are rotated at 10,000 lines and archived to a file in the same directory, and given a name with a datestamp and serial number. For example, mattermost.2017-03-31.001.',
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_DROPDOWN,
                            key: 'FileLevel',
                            label: 'admin.log.fileLevelTitle',
                            label_default: 'File Log Level:',
                            help_text: 'admin.log.fileLevelDescription',
                            help_text_default: 'This setting determines the level of detail at which log events are written to the log file. ERROR: Outputs only error messages. INFO: Outputs error messages and information around startup and initialization. DEBUG: Prints high detail for developers working on debugging issues.',
                            options: DefinitionConstants.LOG_LEVEL_OPTIONS,
                            needs: [['EnableFile', true]],
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_TEXT,
                            key: 'FileLocation',
                            label: 'admin.log.locationTitle',
                            label_default: 'File Log Directory:',
                            help_text: 'admin.log.locationDescription',
                            help_text_default: 'The location of the log files. If blank, they are stored in the ./logs directory. The path that you set must exist and Mattermost must have write permissions in it.',
                            placeholder: 'admin.log.locationPlaceholder',
                            placeholder_default: 'Enter your file location',
                            needs: [['EnableFile', true]],
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_TEXT,
                            key: 'FileFormat',
                            label: 'admin.log.formatTitle',
                            label_default: 'File Log Format:',
                            help_text: DefinitionConstants.LOG_FORMAT_HELP_TEXT,
                            placeholder: 'admin.log.formatPlaceholder',
                            placeholder_default: 'Enter your file format',
                            needs: [['EnableFile', true]],
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableWebhookDebugging',
                            label: 'admin.log.enableWebhookDebugging',
                            label_default: 'Enable Webhook Debugging:',
                            help_text: 'admin.log.enableWebhookDebuggingDescription',
                            help_text_default: 'To output the request body of incoming webhooks to the console, enable this setting and set {boldedConsoleLogLevel} to "DEBUG". Disable this setting to remove webhook request body information from console logs when in DEBUG mode.',
                            help_text_values: {
                                boldedConsoleLogLevel: (
                                    <strong>
                                        <FormattedMessage
                                            id='admin.log.consoleLogLevel'
                                            defaultMessage='Console Log Level'
                                        />
                                    </strong>
                                ),
                            },
                        },
                        {
                            type: Constants.SettingsTypes.TYPE_BOOL,
                            key: 'EnableDiagnostics',
                            label: 'admin.log.enableDiagnostics',
                            label_default: 'Enable Diagnostics and Error Reporting:',
                            help_text: 'admin.log.enableDiagnosticsDescription',
                            help_text_default: 'Enable this feature to improve the quality and performance of Mattermost by sending error reporting and diagnostic information to Mattermost, Inc. Read our <a href="https://about.mattermost.com/default-privacy-policy/" target="_blank">privacy policy</a> to learn more.',
                            help_text_html: true,
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
        license: {
            schema: {
                id: 'LicenseSettings',
                component: LicenseSettings,
            },
        },
        audits: {
            schema: {
                id: 'Audits',
                component: Audits,
            },
        },
    },
};
