// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const pluginStatsHandlers = {};

// registerPluginStatsHandler store a site statistics fetcher for a plugin
export function registerPluginStatsHandler(pluginId, handler) {
    pluginStatsHandlers[pluginId] = handler;
}

// unregisterPluginStatsHandler remove possible handlers that a plugin may have registered
export function unregisterPluginStatsHandler(pluginId) {
    Reflect.deleteProperty(pluginStatsHandlers, pluginId);
}

// getPluginStats collects all plugin-related stats for system console in the
// form Record<string, PluginAnalyticsRow>
//
// It will call all handlers in parallel
// Note that keys are supposed to be unique, but it's not checked so one plugin could
// override a stat from anoother
export async function getPluginStats() {
    let stats = {};
    const allHandlers = Object.values(pluginStatsHandlers).map((handler) => handler());
    const res = await Promise.all(allHandlers);
    res.forEach((pluginRes) => {
        stats = {...stats, ...pluginRes};
    });
    return stats;
}
