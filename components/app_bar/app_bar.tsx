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

    let playbooksComponent;
    let boardsComponent;

    // Extract the Playbooks and Boards components so they can be reordered at the beginning of the list
    const filteredComponents = appBarPluginComponents.filter((component) => {
        switch (component.pluginId) {
        case 'playbooks':
            playbooksComponent = component;
            return false;

        case 'focalboard':
            boardsComponent = component;
            return false;

        default:
            return true;
        }
    });

    const pluginComponents = filteredComponents.concat(channelHeaderComponents);

    return (
        <div className={'app-bar'}>
            {playbooksComponent &&
            <AppBarPluginComponent
                component={playbooksComponent}
            />
            }
            {boardsComponent &&
            <AppBarPluginComponent
                component={boardsComponent}
            />
            }
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
