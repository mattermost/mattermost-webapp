// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Constants} from '../../../utils/constants';
import {t} from '../../../utils/i18n';
import SchemaAdminSettings from '../schema_admin_settings';

export default function getEnablePluginSetting(plugin) {
    const escapedPluginId = SchemaAdminSettings.escapePathPart(plugin.id);
    const pluginEnabledConfigKey = 'PluginSettings.PluginStates.' + escapedPluginId + '.Enable';

    return {
        type: Constants.SettingsTypes.TYPE_BOOL,
        key: pluginEnabledConfigKey,
        label: t('admin.plugin.enable_plugin'),
        label_default: 'Enable Plugin: ',
        help_text: t('admin.plugin.enable_plugin.help'),
        help_text_default: 'When true, this plugin is enabled.',
    };
}
