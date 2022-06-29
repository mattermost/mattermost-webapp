// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {getAppBarAppBindings} from 'mattermost-redux/selectors/entities/apps';

import {getAppBarPluginComponents, getChannelHeaderPluginComponents, shouldShowAppBar} from 'selectors/plugins';
import {PluginComponent} from 'types/store/plugins';

import AppBarPluginComponent from './app_bar_plugin_component';
import AppBarBinding from './app_bar_binding';

import './app_bar.scss';

export default function AppBar() {
    const channelHeaderComponents = useSelector(getChannelHeaderPluginComponents);
    const appBarPluginComponents = useSelector(getAppBarPluginComponents);
    const appBarBindings = useSelector(getAppBarAppBindings);

    const enabled = useSelector(shouldShowAppBar);

    if (!enabled) {
        return null;
    }

    const coreProductsIds = ['focalboard', 'playbooks'];

    // The type guard in the filter (which removes all undefined elements) is needed for
    // Typescript to correctly type coreProducts.
    const coreProducts = coreProductsIds.
        map((id) => appBarPluginComponents.find((element) => element.pluginId === id)).
        filter((element): element is PluginComponent => Boolean(element));

    const appBarPluginComponentsWithoutCoreProducts = appBarPluginComponents.filter((element) => !coreProductsIds.includes(element.pluginId));
    const pluginComponents = appBarPluginComponentsWithoutCoreProducts.concat(channelHeaderComponents);

    const isCoreProductsSectionNonEmpty = coreProducts.length > 0;
    const isRegularIconsSectionNonEmpty = pluginComponents.length > 0 || appBarBindings.length > 0;
    const isDividerVisible = isCoreProductsSectionNonEmpty && isRegularIconsSectionNonEmpty;

    return (
        <div className={'app-bar'}>
            {coreProducts.map((product) => (
                <AppBarPluginComponent
                    key={product.id}
                    component={product}
                />
            ))}
            {isDividerVisible && (
                <hr className={'app-bar__divider'}/>
            )}
            {pluginComponents.map((component) => (
                <AppBarPluginComponent
                    key={component.id}
                    component={component}
                />
            ))}
            {appBarBindings.map((binding) => (
                <AppBarBinding
                    key={`${binding.app_id}_${binding.label}`}
                    binding={binding}
                />
            ))}
        </div>
    );
}
