// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import AdminSettings from './admin_settings.jsx';
import BooleanSetting from './boolean_setting.jsx';
import SettingsGroup from './settings_group.jsx';

export default class PluginSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);

        this.renderSettings = this.renderSettings.bind(this);
    }

    getConfigFromState(config) {
        config.PluginSettings.Enable = this.state.enablePlugins;
        config.PluginSettings.EnableUploads = this.state.enableUploads;

        return config;
    }

    getStateFromConfig(config) {
        return {
            enablePlugins: config.PluginSettings.Enable,
            enableUploads: config.PluginSettings.EnableUploads
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.plugins.settings.title'
                defaultMessage='Configuration'
            />
        );
    }

    renderSettings() {
        return (
            <SettingsGroup>
                <BooleanSetting
                    id='enablePlugins'
                    label={
                        <FormattedMessage
                            id='admin.plugins.settings.enable'
                            defaultMessage='Enable Plugins: '
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.plugins.settings.enableDesc'
                            defaultMessage='When true, enables plugins on your Mattermost server. Use plugins to integrate with third-party systems, extend functionality or customize the user interface of your Mattermost server. See <a href="https://about.mattermost.com/default-plugins" target="_blank">documentation</a> to learn more.'
                        />
                    }
                    value={this.state.enablePlugins}
                    onChange={this.handleChange}
                />
                <BooleanSetting
                    id='enableUploads'
                    label={
                        <FormattedMessage
                            id='admin.plugins.settings.enableUploads'
                            defaultMessage='Enable Plugin Uploads: '
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.plugins.settings.enableUploadsDesc'
                            defaultMessage='When true, enables plugin uploads by System Admins at <strong>Plugins > Management</strong>. If you do not plan to upload a plugin, set to false to control which plugins are installed on your server. See <a href="https://about.mattermost.com/default-plugins-uploads" target="_blank">documentation</a> to learn more.'
                        />
                    }
                    value={this.state.enableUploads}
                    onChange={this.handleChange}
                    disabled={!this.state.enablePlugins}
                />
            </SettingsGroup>
        );
    }
}
