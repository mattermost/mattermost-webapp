// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {AppBinding} from '@mattermost/types/apps';
import {appBarEnabled, getAppBarAppBindings} from 'mattermost-redux/selectors/entities/apps';
import {createShallowSelector} from 'mattermost-redux/utils/helpers';

import {GlobalState} from 'types/store';
import {FileDropdownPluginComponent, PluginComponent} from '../types/store/plugins';

export const getFilesDropdownPluginMenuItems = createSelector(
    'getFilesDropdownPluginMenuItems',
    (state: GlobalState) => state.plugins.components.FilesDropdown,
    (components) => {
        return (components || []) as unknown as FileDropdownPluginComponent[];
    },
);

export const getUserGuideDropdownPluginMenuItems = createSelector(
    'getUserGuideDropdownPluginMenuItems',
    (state: GlobalState) => state.plugins.components.UserGuideDropdown,
    (components) => {
        return components;
    },
);

export const getChannelHeaderPluginComponents = createSelector(
    'getChannelHeaderPluginComponents',
    (state: GlobalState) => appBarEnabled(state),
    (state: GlobalState) => state.plugins.components.ChannelHeaderButton,
    (state: GlobalState) => state.plugins.components.AppBar,
    (enabled, channelHeaderComponents = [], appBarComponents = []) => {
        if (!enabled || !appBarComponents.length) {
            return channelHeaderComponents as unknown as PluginComponent[];
        }

        // Remove channel header icons for plugins that have also registered an app bar component
        const appBarPluginIds = appBarComponents.map((appBarComponent) => appBarComponent.pluginId);
        return channelHeaderComponents.filter((channelHeaderComponent) => !appBarPluginIds.includes(channelHeaderComponent.pluginId));
    },
);

const getChannelHeaderMenuPluginComponentsShouldRender = createSelector(
    'getChannelHeaderMenuPluginComponentsShouldRender',
    (state: GlobalState) => state,
    (state: GlobalState) => state.plugins.components.ChannelHeader,
    (state, channelHeaderMenuComponents = []) => {
        return channelHeaderMenuComponents.map((component) => {
            if (typeof component.shouldRender === 'function') {
                return component.shouldRender(state);
            }

            return true;
        });
    },
);

export const getChannelHeaderMenuPluginComponents = createShallowSelector(
    'getChannelHeaderMenuPluginComponents',
    getChannelHeaderMenuPluginComponentsShouldRender,
    (state: GlobalState) => state.plugins.components.ChannelHeader,
    (componentShouldRender = [], channelHeaderMenuComponents = []) => {
        return channelHeaderMenuComponents.filter((component, idx) => componentShouldRender[idx]);
    },
);

export const getChannelIntroPluginComponents = createSelector(
    'getChannelIntroPluginComponents',
    (state: GlobalState) => state.plugins.components.ChannelIntroButton,
    (components = []) => {
        return components;
    },
);

export const getAppBarPluginComponents = createSelector(
    'getAppBarPluginComponents',
    (state: GlobalState) => state.plugins.components.AppBar,
    (components = []) => {
        return components;
    },
);

export const shouldShowAppBar = createSelector(
    'shouldShowAppBar',
    appBarEnabled,
    getAppBarAppBindings,
    getAppBarPluginComponents,
    getChannelHeaderPluginComponents,
    (enabled: boolean, bindings: AppBinding[], appBarComponents: PluginComponent[], channelHeaderComponents) => {
        return enabled && Boolean(bindings.length || appBarComponents.length || channelHeaderComponents.length);
    },
);
