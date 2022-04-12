// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const pluginStatsHandlers = {};

export function registerPluginStatsHandler(pluginId, handler) {
    pluginStatsHandlers[pluginId] = handler;
}

// TODO check how to deal with plugin removal
// export function unregisterPluginStatsHandler(pluginId) {
//     Reflect.deleteProperty(pluginStatsHandlers, pluginId);
// }

export function getPluginStats() {
    let stats = {};
    Object.values(pluginStatsHandlers).forEach((handler) => {
        stats = {...stats, ...handler()};
    });
    return stats;
}
