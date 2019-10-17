// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {stripMarkdown} from 'utils/markdown';

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

        if (plugin.settings_schema.settings) {
            for (const setting of Object.values(plugin.settings_schema.settings)) {
                if (setting.label) {
                    texts.push(stripMarkdown(setting.label));
                }
                if (setting.display_name) {
                    texts.push(stripMarkdown(setting.display_name));
                }
                if (setting.help_text) {
                    texts.push(stripMarkdown(setting.help_text));
                }
                if (setting.key) {
                    texts.push(setting.key);
                }
            }
        }
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
