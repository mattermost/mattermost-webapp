// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import SchemaAdminSettings from 'components/admin_console/schema_admin_settings.jsx';

export default class CustomPluginSettings extends SchemaAdminSettings {
    componentWillReceiveProps = (nextProps) => {
        if (nextProps.schema !== this.props.schema) {
            this.setState(this.getStateFromConfig(nextProps.config, nextProps.schema));
        }
    }

    getConfigFromState = (config) => {
        const schema = this.props.schema;

        if (schema) {
            if (!config.PluginSettings.Plugins[schema.id]) {
                config.PluginSettings.Plugins[schema.id] = {};
            }

            const configSettings = config.PluginSettings.Plugins[schema.id];

            const settings = schema.settings || [];
            settings.forEach((setting) => {
                const lowerKey = setting.key.toLowerCase();
                configSettings[lowerKey] = this.state[lowerKey];
            });
        }

        return config;
    }

    getStateFromConfig = (config, schema = this.props.schema) => {
        const state = {};

        if (schema) {
            const configSettings = config.PluginSettings.Plugins[schema.id] || {};

            const settings = schema.settings || [];
            settings.forEach((setting) => {
                const lowerKey = setting.key.toLowerCase();
                state[lowerKey] = configSettings[lowerKey] == null ? setting.default : configSettings[lowerKey];
            });
        }

        return state;
    }
}
