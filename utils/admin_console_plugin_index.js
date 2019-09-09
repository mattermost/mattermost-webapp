// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
function extractTextsFromPlugin(plugin) {
    const texts = [];
    if (plugin.name) {
        texts.push(plugin.name);
    }
    if (plugin.id) {
        texts.push(plugin.id);
    }
    if (plugin.settings_schema) {
        if (plugin.settings_schema.footer) {
            texts.push(plugin.settings_schema.footer);
        }
        if (plugin.settings_schema.header) {
            texts.push(plugin.settings_schema.header);
        }
    }

    if (plugin.settings_schema && plugin.settings_schema.settings) {
        for (const setting of Object.values(plugin.settings_schema.settings)) {
            if (setting.label) {
                texts.push(setting.label);
            }
            if (setting.display_name) {
                texts.push(setting.display_name);
            }
            if (setting.help_text) {
                texts.push(setting.help_text);
            }
            if (setting.key) {
                texts.push(setting.key);
            }
        }
    }
    return texts;
}

export function getPluginEntries(plugins = {}) {
    const entries = {};
    for (const pluginId of Object.keys(plugins || {})) {
        const url = `plugin_${pluginId}`;
        entries[url] = extractTextsFromPlugin(plugins[pluginId]);
    }
    return entries;
}
