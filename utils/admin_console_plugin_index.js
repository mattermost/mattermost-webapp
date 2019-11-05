// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {stripMarkdown} from 'utils/markdown';
import getEnablePluginSetting from 'components/admin_console/custom_plugin_settings/enable_plugin_setting';

function extractTextsFromPlugin(plugin) {
    const texts = extractTextFromSetting(getEnablePluginSetting(plugin));
    if (plugin.name) {
        texts.push(plugin.name);
    }
    if (plugin.id) {
        texts.push(plugin.id);
    }
    if (plugin.settings_schema) {
        if (plugin.settings_schema.footer) {
            texts.push(stripMarkdown(plugin.settings_schema.footer));
        }
        if (plugin.settings_schema.header) {
            texts.push(stripMarkdown(plugin.settings_schema.header));
        }

        if (plugin.settings_schema.settings) {
            const settings = Object.values(plugin.settings_schema.settings);

            for (const setting of settings) {
                const settingsTexts = extractTextFromSetting(setting, texts);
                texts.push(...settingsTexts);
            }
        }
    }
    return texts;
}

function extractTextFromSetting(setting) {
    const texts = [];
    if (setting.label) {
        texts.push(setting.label);
    }
    if (setting.display_name) {
        texts.push(setting.display_name);
    }
    if (setting.help_text) {
        texts.push(stripMarkdown(setting.help_text));
    }
    if (setting.key) {
        texts.push(setting.key);
    }
    return texts;
}

export function getPluginEntries(pluginsObj = {}) {
    const entries = {};
    const plugins = pluginsObj || {};
    for (const pluginId of Object.keys(plugins)) {
        const url = `plugin_${pluginId}`;
        entries[url] = extractTextsFromPlugin(plugins[pluginId]);
    }
    return entries;
}
