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
        },
        authentication: {
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
