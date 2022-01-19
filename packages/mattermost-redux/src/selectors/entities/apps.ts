// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {GlobalState} from 'mattermost-redux/types/store';
import {AppBinding} from 'mattermost-redux/types/apps';
import {ClientConfig} from 'mattermost-redux/types/config';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {AppBindingLocations} from 'mattermost-redux/constants/apps';

import {Locations} from 'utils/constants';

// This file's contents belong to the Apps Framework feature.
// Apps Framework feature is experimental, and the contents of this file are
// susceptible to breaking changes without pushing the major version of this package.
export const appsEnabled = createSelector(
    'appsEnabled',
    (state: GlobalState) => getConfig(state),
    (config?: Partial<ClientConfig>) => {
        const enabled = config?.['FeatureFlagAppsEnabled' as keyof Partial<ClientConfig>];
        return enabled === 'true';
    },
);

export const appBarEnabled = createSelector(
    'appBarEnabled',
    (state: GlobalState) => getConfig(state),
    (config?: Partial<ClientConfig>) => {
        const enabled = config?.['FeatureFlagAppBarEnabled' as keyof Partial<ClientConfig>];
        return enabled === 'true';
    },
);

export const makeAppBindingsSelector = (location: string) => {
    return createSelector(
        'makeAppBindingsSelector',
        (state: GlobalState) => state.entities.apps.main.bindings,
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

export const getChannelHeaderAppBindings = createSelector(
    'getChannelHeaderAppBindings',
    appBarEnabled,
    makeAppBindingsSelector(AppBindingLocations.CHANNEL_HEADER_ICON),
    (enabled: boolean, channelHeaderBindings: AppBinding[]) => {
        return enabled ? [] : channelHeaderBindings;
    },
);

export const getAppBarAppBindings = createSelector(
    'getAppBarAppBindings',
    appBarEnabled,
    makeAppBindingsSelector(AppBindingLocations.CHANNEL_HEADER_ICON),
    makeAppBindingsSelector(AppBindingLocations.APP_BAR),
    (enabled: boolean, channelHeaderBindings: AppBinding[], appBarBindings: AppBinding[]) => {
        if (!enabled) {
            return [];
        }

        const appIds = appBarBindings.map((b) => b.app_id);
        const backwardsCompatibleBindings = channelHeaderBindings.filter((b) => !appIds.includes(b.app_id));

        return appBarBindings.concat(backwardsCompatibleBindings);
    },
);

export const makeRHSAppBindingSelector = (location: string) => {
    return createSelector(
        'makeRHSAppBindingSelector',
        (state: GlobalState) => state.entities.apps.rhs.bindings,
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

export const getAppCommandForm = (state: GlobalState, location: string) => {
    return state.entities.apps.main.forms[location];
};

export const getAppRHSCommandForm = (state: GlobalState, location: string) => {
    return state.entities.apps.rhs.forms[location];
};

export function makeGetPostOptionBinding(): (state: GlobalState, location?: string) => AppBinding[] | null {
    const centerBindingsSelector = makeAppBindingsSelector(AppBindingLocations.POST_MENU_ITEM);
    const rhsBindingsSelector = makeRHSAppBindingSelector(AppBindingLocations.POST_MENU_ITEM);
    return createSelector(
        'postOptionsBindings',
        centerBindingsSelector,
        rhsBindingsSelector,
        (state: GlobalState, location?: string) => location,
        (centerBindings: AppBinding[], rhsBindings: AppBinding[], location?: string) => {
            switch (location) {
            case Locations.RHS_ROOT:
            case Locations.RHS_COMMENT:
                return rhsBindings;
            case Locations.SEARCH:
                return null;
            case Locations.CENTER:
            default:
                return centerBindings;
            }
        },
    );
}
