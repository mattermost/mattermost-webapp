// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import SchemaAdminSettings from 'components/admin_console/schema_admin_settings.jsx';

export default class CustomPluginSettings extends SchemaAdminSettings {
    constructor(props) {
        super(props);
        this.isPlugin = true;
        this.getStateFromConfig = CustomPluginSettings.getStateFromConfig;
    }

    static getDerivedStateFromProps(props, state) {
        if (props.schema && props.schema.id !== state.prevSchemaId) {
            return {
                prevSchemaId: props.schema.id,
                saveNeeded: false,
                saving: false,
                serverError: null,
                errorTooltip: false,
                ...CustomPluginSettings.getStateFromConfig(props.config, props.schema, props.roles),
            };
        }
        return null;
    }

    getConfigFromState(config) {
        const schema = this.props.schema;

        if (schema) {
            if (!config.PluginSettings.Plugins[schema.id]) {
                config.PluginSettings.Plugins[schema.id] = {};
            }

            const configSettings = config.PluginSettings.Plugins[schema.id];

            const settings = schema.settings || [];
            settings.forEach((setting) => {
                const lowerKey = setting.key.toLowerCase();
                const value = this.state[lowerKey];
                if (value == null && setting.default == null) {
                    Reflect.deleteProperty(configSettings, lowerKey);
                } else if (value == null) {
                    configSettings[lowerKey] = setting.default;
                } else {
                    configSettings[lowerKey] = value;
                }
            });
        }

        return config;
    }

    static getStateFromConfig(config, schema) {
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
