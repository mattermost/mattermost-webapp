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

    // fake it til make it
    // let stats = {
    //     playbook_count: {
    //         name: 'Playbook count',
    //         id: 'playbook_count',
    //         icon: 'icon',
    //         value: 545,
    //     },
    //     playbook_run_count: {
    //         name: 'Playbook runs count',
    //         id: 'playbook_runs_count',
    //         icon: 'icon',
    //         value: 5425,
    //     },
    // };
    Object.entries(pluginStatsHandlers).forEach((key, handler) => {
        stats = {...stats, ...handler()};
    });
    return stats;
}
