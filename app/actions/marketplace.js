// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';

import {getFilter, getPlugin} from 'selectors/views/marketplace';
import {ActionTypes} from 'utils/constants';

// fetchPlugins fetches the latest marketplace plugins, subject to any existing search filter.
export function fetchPlugins(localOnly = false) {
    return async (dispatch, getState) => {
        const state = getState();
        const filter = getFilter(state);

        try {
            const plugins = await Client4.getMarketplacePlugins(filter, localOnly);

            dispatch({
                type: ActionTypes.RECEIVED_MARKETPLACE_PLUGINS,
                plugins,
            });

            return {plugins};
        } catch (error) {
            // If the marketplace server is unreachable, try to get the local plugins only.
            if (error.server_error_id === 'app.plugin.marketplace_client.failed_to_fetch' && !localOnly) {
                await dispatch(fetchPlugins(true));
            }
            return {error};
        }
    };
}

// installPlugin installs the latest version of the given plugin from the marketplace.
//
// On success, it also requests the current state of the plugins to reflect the newly installed plugin.
export function installPlugin(id, version) {
    return async (dispatch, getState) => {
        dispatch({
            type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN,
            id,
        });

        const state = getState();

        const marketplacePlugin = getPlugin(state, id);
        if (!marketplacePlugin) {
            dispatch({
                type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_FAILED,
                id,
                error: 'Unknown plugin: ' + id,
            });
            return;
        }

        try {
            await Client4.installMarketplacePlugin(id, version);
        } catch (error) {
            dispatch({
                type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_FAILED,
                id,
                error: error.message,
            });
            return;
        }

        await dispatch(fetchPlugins());
        dispatch({
            type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_SUCCEEDED,
            id,
        });
    };
}

// filterPlugins sets a search filter for marketplace plugins, fetching the latest data.
export function filterPlugins(filter) {
    return async (dispatch) => {
        dispatch({
            type: ActionTypes.FILTER_MARKETPLACE_PLUGINS,
            filter,
        });

        return dispatch(fetchPlugins());
    };
}
