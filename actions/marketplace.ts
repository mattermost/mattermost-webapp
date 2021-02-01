// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {ActionFunc, DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import type {MarketplaceApp, MarketplacePlugin} from 'mattermost-redux/types/marketplace';
import type {CommandArgs} from 'mattermost-redux/types/integrations';

import {GlobalState} from 'types/store';

import {getApp, getFilter, getPlugin} from 'selectors/views/marketplace';
import {ActionTypes} from 'utils/constants';

import {executeCommand} from './command';

// fetchPlugins fetches the latest marketplace plugins and apps, subject to any existing search filter.
export function fetchListing(localOnly = false): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;
        const filter = getFilter(state);

        let plugins: MarketplacePlugin[];
        let apps: MarketplaceApp[];

        try {
            plugins = await Client4.getMarketplacePlugins(filter, localOnly);
        } catch (error) {
            // If the marketplace server is unreachable, try to get the local plugins only.
            if (error.server_error_id === 'app.plugin.marketplace_client.failed_to_fetch' && !localOnly) {
                await dispatch(fetchListing(true));
            }
            return {error};
        }

        dispatch({
            type: ActionTypes.RECEIVED_MARKETPLACE_PLUGINS,
            plugins,
        });

        try {
            apps = await Client4.getMarketplaceApps(filter);
        } catch (error) {
            return {data: plugins};
        }

        dispatch({
            type: ActionTypes.RECEIVED_MARKETPLACE_APPS,
            apps,
        });

        if (plugins) {
            return {data: (plugins as Array<MarketplacePlugin | MarketplaceApp>).concat(apps)};
        }

        return {data: apps};
    };
}

// filterApps sets a search filter for marketplace listing, fetching the latest data.
export function filterListing(filter: string): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: ActionTypes.FILTER_MARKETPLACE_LISTING,
            filter,
        });

        return dispatch(fetchListing());
    };
}

// installPlugin installs the latest version of the given plugin from the marketplace.
//
// On success, it also requests the current state of the plugins to reflect the newly installed plugin.
export function installPlugin(id: string, version: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc): Promise<void> => {
        dispatch({
            type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN,
            id,
        });

        const state = getState() as GlobalState;

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

        await dispatch(fetchListing());
        dispatch({
            type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_SUCCEEDED,
            id,
        });
    };
}

// installApp installed an App using a given URL via the /apps install slash command.
//
// On success, it also requests the current state of the plugins to reflect the newly installed plugin.
export function installApp(id: string, url: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc): Promise<void> => {
        dispatch({
            type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN,
            id,
        });

        const state = getState() as GlobalState;

        const channelID = getCurrentChannelId(state);
        const teamID = getCurrentTeamId(state);

        const marketplacePlugin = getApp(state, id);
        if (!marketplacePlugin) {
            dispatch({
                type: ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_FAILED,
                id,
                error: 'Unknown plugin: ' + id,
            });
            return;
        }

        const args: CommandArgs = {
            channel_id: channelID,
            team_id: teamID,
        };

        dispatch(executeCommand('/apps install --force --url ' + url + ' --app-secret some-secret', args));
    };
}
