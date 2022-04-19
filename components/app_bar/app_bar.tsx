// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {getAppBarAppBindings} from 'mattermost-redux/selectors/entities/apps';

import {getAppBarPluginComponents, shouldShowAppBar} from 'selectors/plugins';

import AppBarPluginComponent from './app_bar_plugin_component';
import AppBarBinding from './app_bar_binding';

import './app_bar.scss';

export default function AppBar() {
    const appBarPluginComponents = useSelector(getAppBarPluginComponents);
    const appBarBindings = useSelector(getAppBarAppBindings);

    const enabled = useSelector(shouldShowAppBar);

    if (!enabled) {
        return null;
    }

    return (
        <div className={'app-bar'}>
            {appBarPluginComponents.map((component) => (
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
