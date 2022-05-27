// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {getAppBarAppBindings} from 'mattermost-redux/selectors/entities/apps';

import {getAppBarPluginComponents, getChannelHeaderPluginComponents, shouldShowAppBar} from 'selectors/plugins';

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

    // Order the plugin components so that Playbooks is the first one,
    // Boards is the second one, and the others remain in the same place.
    const orderedAppBarPluginComponents = [...appBarPluginComponents];
    orderedAppBarPluginComponents.sort((a, b) => {
        switch (a.pluginId) {
        case 'playbooks':
            return -1;

        case 'focalboard':
            return b.pluginId === 'playbooks' ? 1 : -1;

        default:
            return 1;
        }
    });

    const pluginComponents = orderedAppBarPluginComponents.concat(channelHeaderComponents);

    return (
        <div className={'app-bar'}>
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
