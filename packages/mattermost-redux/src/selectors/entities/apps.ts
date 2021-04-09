// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {GlobalState} from 'mattermost-redux/types/store';
import {AppBinding} from 'mattermost-redux/types/apps';
import {ClientConfig} from 'mattermost-redux/types/config';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

// This file's contents belong to the Apps Framework feature.
// Apps Framework feature is experimental, and the contents of this file are
// susceptible to breaking changes without pushing the major version of this package.
export const appsEnabled = createSelector(
    (state: GlobalState) => getConfig(state),
    (config?: Partial<ClientConfig>) => {
        const enabled = config?.['FeatureFlagAppsEnabled' as keyof Partial<ClientConfig>];
        return enabled === 'true';
    },
);

export const makeAppBindingsSelector = (location: string) => {
    return createSelector(
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
