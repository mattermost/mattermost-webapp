// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {GlobalState} from 'mattermost-redux/types/store';
import {AppBinding} from 'mattermost-redux/types/apps';
import {Plugin} from 'mattermost-redux/types/plugins';
import {ClientConfig} from 'mattermost-redux/types/config';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {Dictionary} from 'mattermost-redux/types/utilities';
import {appsPluginID} from 'utils/apps';

// This file's contents belong to the Apps Framework feature.
// Apps Framework feature is experimental, and the contents of this file are
// susceptible to breaking changes without pushing the major version of this package.
export const appsEnabled = createSelector(
    'appsEnabled',
    (state: GlobalState) => getConfig(state),
    (state: GlobalState) => state.plugins.plugins,
    (config: Partial<ClientConfig>, plugins: Dictionary<Plugin>) => {
        const featureFlagEnabled = config?.['FeatureFlagAppsEnabled' as keyof Partial<ClientConfig>] === 'true';
        const pluginEnabled = Boolean(plugins[appsPluginID]);

        return featureFlagEnabled && pluginEnabled;
    },
);

export const makeAppBindingsSelector = (location: string) => {
    return createSelector(
        'makeAppBindingsSelector',
        (state: GlobalState) => state.entities.apps.bindings,
        (state: GlobalState) => appsEnabled(state),
        (bindings: AppBinding[], areAppsEnabled: boolean) => {
            if (!areAppsEnabled || !bindings) {
                return [];
            }

            const headerBindings = bindings.filter((b) => b.location === location);
            return headerBindings.reduce((accum: AppBinding[], current: AppBinding) => accum.concat(current.bindings || []), []);
        },
    );
};
