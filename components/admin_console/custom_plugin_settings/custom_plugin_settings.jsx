// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import SchemaAdminSettings from 'components/admin_console/schema_admin_settings.jsx';

export default class CustomPluginSettings extends SchemaAdminSettings {
    constructor(props) {
        super(props);
        this.isPlugin = true;
    }

    componentWillReceiveProps(nextProps) {
        const id = this.props.schema ? this.props.schema.id : '';
        const nextId = nextProps.schema ? nextProps.schema.id : '';

        if ((!this.props.schema && nextProps.schema) || (id !== nextId)) {
            this.setState(this.getStateFromConfig(nextProps.config, nextProps.schema));
        }
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
                const value = this.state[lowerKey] || setting.default;
                if (value == null) {
                    Reflect.deleteProperty(configSettings, lowerKey);
                } else {
                    configSettings[lowerKey] = value;
                }
            });
        }

        return config;
    }

    getStateFromConfig(config, schema = this.props.schema) {
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
