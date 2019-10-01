// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {getRoles} from 'mattermost-redux/selectors/entities/roles';

import {Constants} from 'utils/constants';
import {t} from 'utils/i18n';
import SchemaAdminSettings from '../schema_admin_settings';
import {it} from '../admin_definition';

import CustomPluginSettings from './custom_plugin_settings.jsx';

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

            settings.unshift({
                type: Constants.SettingsTypes.TYPE_BOOL,
                key: pluginEnabledConfigKey,
                label: t('admin.plugin.enable_plugin'),
                label_default: 'Enable Plugin: ',
                help_text: t('admin.plugin.enable_plugin.help'),
                help_text_default: 'When true, this plugin is enabled.',
            });

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
