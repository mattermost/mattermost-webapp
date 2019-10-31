// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getMarketplacePlugins} from 'mattermost-redux/actions/plugins';
import {installPluginFromUrl} from 'mattermost-redux/actions/admin';

import {getFilter, getPlugin} from 'selectors/views/marketplace';
import {ActionTypes} from 'utils/constants';

// getPlugins fetches the latest marketplace plugins, subject to any existing search filter.
export function fetchPlugins() {
    return async (dispatch, getState) => {
        const state = getState();
        const filter = getFilter(state);

        return dispatch(getMarketplacePlugins(filter));
    };
}

// installPlugin installs the latest version of the given plugin from the marketplace.
//
// On success, it also requests the current state of the plugins to reflect the newly installed plugin.
export function installPlugin(id) {
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

        const downloadUrl = marketplacePlugin.download_url;
        const {error} = await dispatch(installPluginFromUrl(downloadUrl, true));
        if (error) {
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

// filterMarketplacePlugins sets a search filter for marketplace plugins, fetching the latest data.
export function filterPlugins(filter) {
    return async (dispatch) => {
        dispatch({
            type: ActionTypes.FILTER_MARKETPLACE_PLUGINS,
            filter,
        });

        await dispatch(fetchPlugins());
    };
}