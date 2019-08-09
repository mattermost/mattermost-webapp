// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export let cache = null;
const adminDefinitionsPlugins = {};

export function registerAdminConsolePlugin(pluginId, func) {
    adminDefinitionsPlugins[pluginId] = func;
    cache = null;
}

export function unregisterAdminConsolePlugin(pluginId) {
    if (adminDefinitionsPlugins[pluginId]) {
        delete adminDefinitionsPlugins[pluginId];
        cache = null;
    }
}

export function getAdminDefinitionPlugins() {
    return adminDefinitionsPlugins;
}

export function setAdminDefinitionCache(value) {
    cache = value;
}

export function getAdminDefinitionCache() {
    return cache;
}
