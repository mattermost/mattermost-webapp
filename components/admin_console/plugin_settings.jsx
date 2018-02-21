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

        return config;
    }

    getStateFromConfig(config) {
        return {
            enablePlugins: config.PluginSettings.Enable,
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
            </SettingsGroup>
        );
    }
}
