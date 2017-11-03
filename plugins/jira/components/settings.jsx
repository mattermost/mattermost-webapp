// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import crypto from 'crypto';

import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

import AdminSettings from 'components/admin_console/admin_settings.jsx';
import BooleanSetting from 'components/admin_console/boolean_setting.jsx';
import GeneratedSetting from 'components/admin_console/generated_setting.jsx';
import UserAutocompleteSetting from 'components/admin_console/user_autocomplete_setting.jsx';
import SettingsGroup from 'components/admin_console/settings_group.jsx';

export default class JIRASettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.handleSecretChange = this.handleSecretChange.bind(this);
        this.handleEnabledChange = this.handleEnabledChange.bind(this);
    }

    getConfigFromState(config) {
        config.PluginSettings.Plugins = {
            jira: {
                Enabled: this.state.enabled,
                Secret: this.state.secret,
                UserName: this.state.userName
            }
        };

        return config;
    }

    getStateFromConfig(config) {
        const settings = config.PluginSettings;

        const ret = {
            enabled: false,
            secret: '',
            userName: '',
            siteURL: config.ServiceSettings.SiteURL
        };

        if (typeof settings.Plugins !== 'undefined' && typeof settings.Plugins.jira !== 'undefined') {
            ret.enabled = settings.Plugins.jira.Enabled || settings.Plugins.jira.enabled || false;
            ret.secret = settings.Plugins.jira.Secret || settings.Plugins.jira.secret || '';
            ret.userName = settings.Plugins.jira.UserName || settings.Plugins.jira.username || '';
        }

        return ret;
    }

    handleSecretChange(id, secret) {
        this.handleChange(id, secret.replace('+', '-').replace('/', '_'));
    }

    handleEnabledChange(enabled) {
        if (enabled && this.state.secret === '') {
            this.handleSecretChange('secret', crypto.randomBytes(256).toString('base64').substring(0, 32));
        }
        this.handleChange('enabled', enabled);
    }

    renderTitle() {
        return Utils.localizeMessage('admin.plugins.jira', 'JIRA (Beta)');
    }

    renderSettings() {
        var webhookDocsLink = (
            <a
                href='https://about.mattermost.com/default-jira-plugin'
                target='_blank'
                rel='noopener noreferrer'
            >
                <FormattedMessage
                    id='admin.plugins.jira.webhookDocsLink'
                    defaultMessage='documentation'
                />
            </a>
        );

        return (
            <SettingsGroup>
                <BooleanSetting
                    id='enabled'
                    label={Utils.localizeMessage('admin.plugins.jira.enabledLabel', 'Enable JIRA:')}
                    helpText={Utils.localizeMessage('admin.plugins.jira.enabledDescription', 'When true, you can configure JIRA webhooks to post message in Mattermost. To help combat phishing attacks, all posts are labelled by a BOT tag.')}
                    value={this.state.enabled}
                    onChange={(id, value) => this.handleEnabledChange(value)}
                />
                <UserAutocompleteSetting
                    id='userName'
                    label={Utils.localizeMessage('admin.plugins.jira.userLabel', 'User:')}
                    helpText={Utils.localizeMessage('admin.plugins.jira.userDescription', 'Select the username that this integration is attached to.')}
                    placeholder={Utils.localizeMessage('search_bar.search', 'Search')}
                    disabled={!this.state.enabled}
                    value={this.state.userName}
                    onChange={this.handleChange}
                />
                <GeneratedSetting
                    id='secret'
                    label={Utils.localizeMessage('admin.plugins.jira.secretLabel', 'Secret:')}
                    helpText={Utils.localizeMessage('admin.plugins.jira.secretDescription', 'This secret is used to authenticate to Mattermost.')}
                    regenerateHelpText={Utils.localizeMessage('admin.plugins.jira.secretRegenerateDescription', 'Regenerates the secret for the webhook URL endpoint. Regenerating the secret invalidates your existing JIRA integrations.')}
                    value={this.state.secret}
                    onChange={this.handleSecretChange}
                    disabled={!this.state.enabled}
                />
                <div className='banner banner--url'>
                    <div className='banner__content'>
                        <p>
                            <FormattedMessage
                                id='admin.plugins.jira.setupDescription'
                                defaultMessage='Use this webhook URL to set up the JIRA integration. See {webhookDocsLink} to learn more.'
                                values={{
                                    webhookDocsLink
                                }}
                            />
                        </p>
                        <div className='banner__url'>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: encodeURI(this.state.siteURL) +
                                        '/plugins/jira/webhook?secret=' +
                                        (this.state.secret ? encodeURIComponent(this.state.secret) : ('<b>' + Utils.localizeMessage('admin.plugins.jira.secretParamPlaceholder', 'secret') + '</b>')) +
                                        '&team=<b>' +
                                        Utils.localizeMessage('admin.plugins.jira.teamParamPlaceholder', 'teamurl') +
                                        '</b>&channel=<b>' +
                                        Utils.localizeMessage('admin.plugins.jira.channelParamNamePlaceholder', 'channelurl') +
                                        '</b>'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </SettingsGroup>
        );
    }
}
