// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {getRoles} from 'mattermost-redux/selectors/entities/roles';

import SchemaAdminSettings from '../schema_admin_settings';
import {it} from '../admin_definition';

import CustomPluginSettings from './custom_plugin_settings.jsx';
import getEnablePluginSetting from './enable_plugin_setting';

function makeGetPluginSchema() {
    return createSelector(
        (state, pluginId) => state.entities.admin.plugins[pluginId],
        (plugin) => {
            if (!plugin) {
                return null;
            }

            const escapedPluginId = SchemaAdminSettings.escapePathPart(plugin.id);
            const pluginEnabledConfigKey = 'PluginSettings.PluginStates.' + escapedPluginId + '.Enable';

            let settings = [];
            if (plugin.settings_schema && plugin.settings_schema.settings) {
                settings = plugin.settings_schema.settings.map((setting) => {
                    return {
                        ...setting,
                        key: 'PluginSettings.Plugins.' + escapedPluginId + '.' + setting.key.toLowerCase(),
                        help_text_markdown: true,
                        label: setting.display_name,
                        translate: Boolean(plugin.translate),
                        isDisabled: it.stateIsFalse(pluginEnabledConfigKey),
                    };
                });
            }

            settings.unshift(getEnablePluginSetting(plugin));

            return {
                ...plugin.settings_schema,
                id: plugin.id,
                name: plugin.name,
                settings,
                translate: Boolean(plugin.translate),
            };
        }
    );
}

function makeMapStateToProps() {
    const getPluginSchema = makeGetPluginSchema();

    return (state, ownProps) => {
        const pluginId = ownProps.match.params.plugin_id;

        return {
            schema: getPluginSchema(state, pluginId),
            roles: getRoles(state),
        };
    };
}

export default connect(makeMapStateToProps)(CustomPluginSettings);
