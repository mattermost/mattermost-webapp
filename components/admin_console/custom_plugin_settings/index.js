// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {getRoles} from 'mattermost-redux/selectors/entities/roles';

import {Constants} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';

import {getAdminConsoleCustomComponents} from 'selectors/admin_console';
import SchemaAdminSettings from '../schema_admin_settings';
import {it} from '../admin_definition';

import CustomPluginSettings from './custom_plugin_settings.jsx';
import getEnablePluginSetting from './enable_plugin_setting';

function makeGetPluginSchema() {
    return createSelector(
        (state, pluginId) => state.entities.admin.plugins[pluginId],
        (state, pluginId) => getAdminConsoleCustomComponents(state, pluginId),
        (plugin, customComponents) => {
            if (!plugin) {
                return null;
            }

            const escapedPluginId = SchemaAdminSettings.escapePathPart(plugin.id);
            const pluginEnabledConfigKey = 'PluginSettings.PluginStates.' + escapedPluginId + '.Enable';

            let settings = [];
            if (plugin.settings_schema && plugin.settings_schema.settings) {
                settings = plugin.settings_schema.settings.map((setting) => {
                    const key = setting.key.toLowerCase();
                    let component = null;
                    let bannerType = '';
                    let type = setting.type;
                    let displayName = setting.display_name;
                    let isDisabled = it.any(it.stateIsFalse(pluginEnabledConfigKey), it.not(it.userHasWritePermissionOnResource('plugins')));

                    if (customComponents[key]) {
                        component = customComponents[key].component;
                        type = Constants.SettingsTypes.TYPE_CUSTOM;
                    } else if (setting.type === Constants.SettingsTypes.TYPE_CUSTOM) {
                        // Show a warning banner to enable the plugin in order to display the custom component.
                        type = Constants.SettingsTypes.TYPE_BANNER;
                        displayName = localizeMessage('admin.plugin.customSetting.pluginDisabledWarning', 'In order to view this setting, enable the plugin and click Save.');
                        bannerType = 'warning';
                        isDisabled = it.any(it.stateIsTrue(pluginEnabledConfigKey), it.not(it.userHasWritePermissionOnResource('plugins')));
                    }

                    return {
                        ...setting,
                        type,
                        key: 'PluginSettings.Plugins.' + escapedPluginId + '.' + key,
                        help_text_markdown: true,
                        label: displayName,
                        translate: Boolean(plugin.translate),
                        isDisabled,
                        banner_type: bannerType,
                        component,
                        showTitle: customComponents[key] ? customComponents[key].options.showTitle : false,
                    };
                });
            }

            const pluginEnableSetting = getEnablePluginSetting(plugin);
            pluginEnableSetting.isDisabled = it.any(pluginEnableSetting.isDisabled, it.not(it.userHasWritePermissionOnResource('plugins')));
            settings.unshift(pluginEnableSetting);

            settings.forEach((s) => {
                s.isDisabled = it.any(s.isDisabled, it.not(it.userHasWritePermissionOnResource('plugins')));
            });

            return {
                ...plugin.settings_schema,
                id: plugin.id,
                name: plugin.name,
                settings,
                translate: Boolean(plugin.translate),
            };
        },
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
